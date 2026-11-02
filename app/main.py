import re
import time

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pwdlib import PasswordHash

from app.database import SessionLocal
from app.models import Customer, Conversation
from app.agent import process_message
from app.auth import router as auth_router
from app.auth import require_role
from app.services.memory_service import (
    save_message,
    get_history,
    get_conversation_by_customer_from_db,
)

from app.services.dashboard_service import (
    get_dashboard_stats,
    get_recent_orders,
    get_recent_handoffs,
    get_customers,
    get_conversations,
    get_handoffs,
    resolve_handoff,
    get_handoff_details,
    get_customer_details,
    get_order_details,
    get_conversation_details,
    create_order,
    update_order_status,
)


# ==================================================
# 1. CONSTANTS
# ==================================================

OUT_OF_SCOPE_RESPONSE = (
    "I'm here to assist with restaurant-related questions, "
    "including orders, order status, cancellations, refunds, "
    "and customer support. Please ask me something related "
    "to your restaurant order or service."
)


# ==================================================
# 2. PASSWORD HASHING
# ==================================================

password_hash = PasswordHash.recommended()


# ==================================================
# 3. PYDANTIC MODELS
# ==================================================

class OrderItemCreate(BaseModel):
    product_name: str
    quantity: int = Field(gt=0)
    unit_price: float = Field(ge=0)


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemCreate]


class OrderStatusUpdate(BaseModel):
    status: str


class CustomerCreate(BaseModel):
    name: str
    email: str
    password: str = Field(min_length=8)


class CustomerLogin(BaseModel):
    email: str
    password: str


class ChatRequest(BaseModel):
    customer_id: int
    order_id: str | None = None
    message: str
    conversation_id: str


# ==================================================
# 4. FASTAPI APP AND CORS
# ==================================================

app = FastAPI(
    title="AI Customer Support System",
    description="AI-powered customer support with human handoff",
    version="1.0.0",
)
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# 5. ORDER ID EXTRACTION
# ==================================================

def extract_order_id(message: str) -> str | None:
    """
    Extract an order ID such as ORD-A82BF858
    from a customer's message.
    """

    if not message:
        return None

    match = re.search(
        r"\bORD-[A-Z0-9-]+\b",
        message,
        re.IGNORECASE,
    )

    if match:
        return match.group(0).upper()

    return None


# ==================================================
# 6. INTENT DETECTION
# ==================================================

def detect_intent(message: str) -> str:
    """
    Identify the customer's intent from their message.

    Supported intents:
        - cancel_order
        - refund_request
        - human_support
        - order_status
        - customer_info
        - unknown
    """

    message_lower = message.lower().strip()

    # ------------------------------
    # Customer Information
    # ------------------------------

    if any(
        phrase in message_lower
        for phrase in [
            "do you know me",
            "do you know who i am",
            "who am i",
            "what do you know about me",
            "what information do you have about me",
            "what do you know about my account",
            "my profile",
            "my account information",
            "my customer information",
        ]
    ):
        return "customer_info"

    # ------------------------------
    # Cancellation
    # ------------------------------

    if any(
        phrase in message_lower
        for phrase in [
            "cancel",
            "cancellation",
        ]
    ):
        return "cancel_order"

    # ------------------------------
    # Refund
    # ------------------------------

    if any(
        phrase in message_lower
        for phrase in [
            "refund",
            "money back",
            "return my money",
            "get my money back",
        ]
    ):
        return "refund_request"

    # ------------------------------
    # Human Support
    # ------------------------------

    if any(
        phrase in message_lower
        for phrase in [
            "human",
            "staff",
            "real person",
            "talk to someone",
            "speak to someone",
            "customer support agent",
            "human support",
        ]
    ):
        return "human_support"

    # ------------------------------
    # Order Status
    # ------------------------------

    order_keywords = [
        "order",
        "track my order",
        "where is my order",
        "where's my order",
        "order status",
        "track order",
        "check my order",
        "my delivery",
        "delivery status",
    ]

    if any(
        keyword in message_lower
        for keyword in order_keywords
    ):
        return "order_status"

    # ------------------------------
    # Unknown / Out of Scope
    # ------------------------------

    return "unknown"


# ==================================================
# 7. CUSTOMER INFORMATION RESPONSE
# ==================================================

def get_customer_info_response(
    customer_id: int,
) -> str:

    with SessionLocal() as session:

        customer = (
            session.query(Customer)
            .filter_by(id=customer_id)
            .first()
        )

        if customer is None:
            return (
                "I could not find your customer information "
                "in our restaurant system."
            )

        return (
            f"Yes. I can identify you as "
            f"{customer.name} in our restaurant system. "
            f"I can help you with your orders, order status, "
            f"cancellations, refunds, and customer support."
        )


# ==================================================
# 8. CHAT ENDPOINT
# ==================================================

@app.post("/chat")
def chat(request: ChatRequest):

    # ------------------------------
    # Validate message
    # ------------------------------

    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    # ------------------------------
    # Step 1: Detect intent
    # ------------------------------

    intent = detect_intent(message)

    # ------------------------------
    # Step 2: Extract order ID
    # ------------------------------

    extracted_order_id = extract_order_id(message)

    order_id = (
        request.order_id.strip().upper()
        if request.order_id
        and request.order_id.strip()
        else extracted_order_id
    )

    # ------------------------------
    # Step 3: Load previous context
    # ------------------------------

    context = get_conversation_by_customer_from_db(
        request.customer_id
    )

    # ------------------------------
    # Step 4: Recover previous intent
    # ------------------------------

    if intent == "unknown" and order_id:

        previous_intent = None

        if isinstance(context, dict):
            previous_intent = context.get(
                "current_intent"
            )

        if previous_intent in {
            "order_status",
            "cancel_order",
            "refund_request",
            "human_support",
        }:
            intent = previous_intent

    # ------------------------------
    # Step 5: Validate/Create Conversation
    # ------------------------------

    conversation_id = (
        request.conversation_id.strip()
    )

    if not conversation_id:
        raise HTTPException(
            status_code=400,
            detail="Conversation ID cannot be empty.",
        )

    with SessionLocal() as session:

        conversation = (
            session.query(Conversation)
            .filter_by(
                conversation_id=conversation_id
            )
            .first()
        )

        # ------------------------------
        # Conversation does not exist
        # ------------------------------

        if conversation is None:

            conversation = Conversation(
                conversation_id=conversation_id,
                customer_id=request.customer_id,
                current_intent=intent,
                current_order_id=order_id,
                state=(
                    "waiting_for_human_support"
                    if intent == "human_support"
                    else (
                        "refund_request"
                        if intent == "refund_request"
                        else "active"
                    )
                ),
            )

            session.add(conversation)
            session.commit()
            session.refresh(conversation)

            print(
                f"Created new conversation: "
                f"{conversation_id}"
            )

        # ------------------------------
        # Conversation already exists
        # ------------------------------

        else:

            if (
                conversation.customer_id
                != request.customer_id
            ):
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Conversation does not belong "
                        "to this customer."
                    ),
                )

            conversation.current_intent = intent

            if order_id:
                conversation.current_order_id = order_id

            if intent == "human_support":

                conversation.state = (
                    "waiting_for_human_support"
                )

            elif intent == "refund_request":

                conversation.state = (
                    "refund_request"
                )

            elif intent == "cancel_order":

                conversation.state = (
                    "cancellation_request"
                )

            elif intent in {
                "order_status",
                "customer_info",
                "unknown",
            }:

                conversation.state = "active"

            session.commit()

    # ------------------------------
    # Step 6: Save customer message
    # ------------------------------

    save_message(
        customer_id=request.customer_id,
        conversation_id=conversation_id,
        role="customer",
        message=message,
    )

    # ==================================================
    # STEP 7A: CUSTOMER INFORMATION
    # ==================================================

    if intent == "customer_info":

        assistant_response = get_customer_info_response(
            request.customer_id
        )

        save_message(
            customer_id=request.customer_id,
            conversation_id=conversation_id,
            role="assistant",
            message=assistant_response,
        )

        updated_history = get_history(
            request.customer_id
        )

        return {
            "customer_id": request.customer_id,
            "conversation_id": conversation_id,
            "order_id": order_id,
            "message": message,
            "intent": intent,
            "agent_result": {
                "response": assistant_response,
                "source": "customer_database",
            },
            "conversation_history": updated_history,
        }

    # ==================================================
    # STEP 7B: UNKNOWN / OUT OF SCOPE
    # ==================================================

    if intent == "unknown":

        assistant_response = OUT_OF_SCOPE_RESPONSE

        save_message(
            customer_id=request.customer_id,
            conversation_id=conversation_id,
            role="assistant",
            message=assistant_response,
        )

        updated_history = get_history(
            request.customer_id
        )

        return {
            "customer_id": request.customer_id,
            "conversation_id": conversation_id,
            "order_id": order_id,
            "message": message,
            "intent": "unknown",
            "agent_result": {
                "response": assistant_response,
                "source": "out_of_scope_handler",
            },
            "conversation_history": updated_history,
        }

    # ==================================================
    # STEP 7C: SEND RESTAURANT REQUEST TO AGENT
    # ==================================================

    start_time = time.perf_counter()

    try:

        result = process_message(
            intent=intent,
            customer_id=request.customer_id,
            order_id=order_id,
            message=message,
            conversation_id=conversation_id,
        )

    except Exception as exc:

        print(
            "Chat processing error:",
            repr(exc),
        )

        raise HTTPException(
            status_code=500,
            detail="The chat request could not be processed.",
        ) from exc

    elapsed_time = (
        time.perf_counter()
        - start_time
    )

    # ------------------------------
    # Step 8: Logging
    # ------------------------------

    print(
        f"AI Agent response time: "
        f"{elapsed_time:.2f} seconds"
    )

    print(
        "Customer ID:",
        request.customer_id,
    )

    print(
        "Conversation ID:",
        conversation_id,
    )

    print(
        "Detected intent:",
        intent,
    )

    print(
        "Order ID:",
        order_id,
    )

    # ------------------------------
    # Step 9: Save assistant response
    # ------------------------------

    assistant_response = result.get(
        "response"
    )

    if (
        isinstance(assistant_response, str)
        and assistant_response
    ):

        save_message(
            customer_id=request.customer_id,
            conversation_id=conversation_id,
            role="assistant",
            message=assistant_response,
        )

    # ------------------------------
    # Step 10: Get updated history
    # ------------------------------

    updated_history = get_history(
        request.customer_id
    )

    # ------------------------------
    # Step 11: Return response
    # ------------------------------

    return {
        "customer_id": request.customer_id,
        "conversation_id": conversation_id,
        "order_id": result.get(
            "order_id",
            order_id,
        ),
        "message": message,
        "intent": intent,
        "agent_result": result,
        "conversation_history": updated_history,
    }


# ==================================================
# 9. HOME
# ==================================================

@app.get("/")
def home():

    return {
        "message": (
            "AI Customer Support System is running"
        ),
        "status": "ok",
    }


# ==================================================
# 10. DASHBOARD
# ==================================================

@app.get("/dashboard/stats")
def dashboard_stats():
    return get_dashboard_stats()


@app.get("/dashboard/orders")
def dashboard_orders(
    current_staff=Depends(
        require_role("staff", "super_admin")
    )
):
    return get_recent_orders()


@app.get("/dashboard/handoffs")
def dashboard_handoffs():
    return get_recent_handoffs()


# ==================================================
# 11. CUSTOMERS
# ==================================================

@app.get("/customers")
def customers(
    current_staff=Depends(
        require_role("staff", "super_admin")
    )
):
    return get_customers()


# --------------------------------------------------
# Customer Registration
# --------------------------------------------------

@app.post("/customers", status_code=201)
def create_customer_endpoint(
    customer_data: CustomerCreate,
):

    with SessionLocal() as session:

        # ------------------------------
        # Check existing email
        # ------------------------------

        existing_customer = (
            session.query(Customer)
            .filter_by(
                email=customer_data.email
            )
            .first()
        )

        if existing_customer:

            raise HTTPException(
                status_code=409,
                detail="Email already registered",
            )

        # ------------------------------
        # Hash password
        # ------------------------------

        hashed_password = password_hash.hash(
            customer_data.password
        )

        # ------------------------------
        # Create customer
        # ------------------------------

        new_customer = Customer(
            name=customer_data.name,
            email=customer_data.email,
            password_hash=hashed_password,
        )

        session.add(new_customer)
        session.commit()
        session.refresh(new_customer)

        # ------------------------------
        # Never return password/hash
        # ------------------------------

        return {
            "id": new_customer.id,
            "name": new_customer.name,
            "email": new_customer.email,
        }


# --------------------------------------------------
# Customer Login
# --------------------------------------------------

@app.post("/login")
def customer_login(
    login_data: CustomerLogin,
):

    with SessionLocal() as session:

        # ------------------------------
        # Find customer by email
        # ------------------------------

        customer = (
            session.query(Customer)
            .filter_by(
                email=login_data.email
            )
            .first()
        )

        if customer is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

        # ------------------------------
        # Verify password
        # ------------------------------

        password_is_valid = password_hash.verify(
            login_data.password,
            customer.password_hash,
        )

        if not password_is_valid:

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

        # ------------------------------
        # Login successful
        # ------------------------------

        return {
            "message": "Login successful",
            "customer": {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email,
            },
        }

@app.get("/customers/{customer_id}")
def customer_details(
    customer_id: int,
    current_staff=Depends(
        require_role("staff", "super_admin")
    ),
):

    result = get_customer_details(
        customer_id
    )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    return result


# ==================================================
# 12. CONVERSATIONS
# ==================================================

@app.get("/conversations")
def conversations():
    return get_conversations()


@app.get("/conversations/{conversation_id}")
def conversation_details(
    conversation_id: str,
):

    result = get_conversation_details(
        conversation_id
    )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    return result


# ==================================================
# 13. HUMAN HANDOFFS
# ==================================================

@app.get("/handoffs")
def handoffs():
    return get_handoffs()


@app.get("/handoffs/{handoff_id}")
def handoff_details(
    handoff_id: int,
):

    result = get_handoff_details(
        handoff_id
    )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Handoff not found",
        )

    return result


@app.put("/handoffs/{handoff_id}/resolve")
def resolve_handoff_endpoint(
    handoff_id: int,
):

    result = resolve_handoff(
        handoff_id
    )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Handoff not found",
        )

    return result


# ==================================================
# 14. ORDERS
# ==================================================

@app.get("/orders/{order_id}")
def order_details(
    order_id: str,
):

    result = get_order_details(
        order_id
    )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    return result


@app.post("/orders", status_code=201)
def create_order_endpoint(
    order_data: OrderCreate,
):

    result = create_order(
        customer_id=order_data.customer_id,
        items=[
            item.model_dump()
            for item in order_data.items
        ],
    )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "Customer not found or cart is empty"
            ),
        )

    return result


@app.patch("/orders/{order_id}/status")
def update_order_status_endpoint(
    order_id: str,
    request: OrderStatusUpdate,
    current_staff=Depends(
        require_role("staff", "super_admin")
    ),
):

    result = update_order_status(
        order_id=order_id,
        status=request.status,
    )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    if (
        isinstance(result, dict)
        and "error" in result
    ):

        raise HTTPException(
            status_code=400,
            detail=result["error"],
        )

    return result