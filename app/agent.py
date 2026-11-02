import time

from app.services.order_service import get_order_status
from app.services.dashboard_service import update_order_status

from app.services.memory_service import (
    get_conversation_by_customer_from_db,
    update_context,
    get_entities,
    get_recent_messages,
    update_conversation_state,
)

from app.services.handoff_service import (
    create_handoff,
)

from app.vector_store import build_rag_context
from app.llm import generate_response


# ============================================================
# 1. HELPER FUNCTIONS
# ============================================================

def get_status(order):
    """
    Return the status from an order dictionary or object.
    """

    if not order:
        return None

    if isinstance(order, dict):
        return order.get("status")

    return getattr(order, "status", None)


def get_product(order):
    """
    Return the product name from an order.
    """

    if not order:
        return "your order"

    if isinstance(order, dict):
        return order.get("product", "your order")

    return getattr(order, "product", "your order")


def get_order_id(order):
    """
    Return the public order ID.
    """

    if not order:
        return None

    if isinstance(order, dict):
        return order.get("order_id")

    return getattr(order, "order_id", None)


def ask_for_order_id():
    """
    Ask the customer to provide an order ID.

    Used when an order-related request does not
    yet contain an order ID.
    """

    return {
        "response": (
            "Of course! Please provide your order ID "
            "so I can help you with your request."
        ),
        "needs_order_id": True,
    }


# ============================================================
# 2. MEMORY
# ============================================================

def save_memory(customer_id, order_id, intent):
    """
    Save the current order, intent, and conversation state.
    """

    if customer_id is None:
        return

    update_context(
        customer_id=customer_id,
        current_order_id=order_id,
        current_intent=intent,
    )

    states = {
        "order_status": "active",
        "cancel_order": "cancellation_request",
        "refund_request": "refund_request",
        "human_support": "waiting_for_human_support",
    }

    state = states.get(intent)

    if state:
        update_conversation_state(
            customer_id=customer_id,
            state=state,
        )


# ============================================================
# 3. HANDOFF CONTEXT
# ============================================================

def build_handoff_context(
    conversation,
    order_id,
    intent,
    order_status,
    recent_messages,
    entities,
    conversation_id=None,
):
    """
    Build the context that will be sent to the human
    support team.

    Priority:
    1. conversation_id received directly from chat
    2. conversation_id stored in memory
    """

    remembered_conversation_id = None

    if isinstance(conversation, dict):
        remembered_conversation_id = conversation.get(
            "conversation_id"
        )

    final_conversation_id = (
        conversation_id
        or remembered_conversation_id
    )

    return {
        "conversation_id": final_conversation_id,
        "order_id": order_id,
        "current_intent": intent,
        "order_status": order_status,
        "recent_messages": recent_messages,
        "important_entities": entities,
    }


# ============================================================
# 4. DECISION LOGIC
# ============================================================

def decide_action(
    intent,
    order_id=None,
    order_status=None,
):
    """
    Decide what the AI should do based on intent
    and the current order status.
    """

    # --------------------------------------------------------
    # ORDER STATUS
    # --------------------------------------------------------

    if intent == "order_status":

        if not order_id:
            return "ask_for_order_id"

        return "get_order_status"

    # --------------------------------------------------------
    # CANCEL ORDER
    # --------------------------------------------------------

    if intent == "cancel_order":

        if not order_id:
            return "ask_for_order_id"

        if order_status is None:
            return "invalid_order"

        if order_status == "pending":
            return "check_cancellation"

        return "cannot_cancel"

    # --------------------------------------------------------
    # REFUND REQUEST
    # --------------------------------------------------------

    if intent == "refund_request":

        # No order ID yet
        if not order_id:
            return "ask_for_order_id"

        # Order ID exists but order was not found
        if order_status is None:
            return "invalid_order"

        # Existing order → send to staff for review
        return "check_refund"

    # --------------------------------------------------------
    # HUMAN SUPPORT
    # --------------------------------------------------------

    if intent == "human_support":
        return "human_handoff"

    # --------------------------------------------------------
    # GENERAL QUESTION
    # --------------------------------------------------------

    return "general_response"


# ============================================================
# 5. CANCELLATION PROCESS
# ============================================================

def process_cancel_order(
    order_id,
    message,
    rag_context=None,
    recent_messages=None,
):
    """
    Cancel an order only when its database status is pending.

    The order status is checked again immediately before
    changing the status to cancelled.
    """

    # --------------------------------------------------------
    # First database check
    # --------------------------------------------------------

    order = get_order_status(order_id)

    if order is None:
        return {
            "response": (
                "I couldn't find that order. "
                "Please check your order ID and try again."
            ),
            "order_id": order_id,
            "cancelled": False,
        }

    current_status = get_status(order)

    # --------------------------------------------------------
    # Order is not pending
    # --------------------------------------------------------

    if current_status != "pending":
        return {
            "response": (
                "This order cannot be cancelled because "
                f"its current status is {current_status}."
            ),
            "order": order,
            "order_id": order_id,
            "status": current_status,
            "cancelled": False,
        }

    # --------------------------------------------------------
    # Second database check
    # --------------------------------------------------------

    latest_order = get_order_status(order_id)

    if latest_order is None:
        return {
            "response": (
                "I couldn't find that order. "
                "Please contact support for assistance."
            ),
            "order_id": order_id,
            "cancelled": False,
        }

    latest_status = get_status(latest_order)

    if latest_status != "pending":
        return {
            "response": (
                "This order can no longer be cancelled "
                "through this process. Its current status is "
                f"{latest_status}."
            ),
            "order": latest_order,
            "order_id": order_id,
            "status": latest_status,
            "cancelled": False,
        }

    # --------------------------------------------------------
    # Update database
    # --------------------------------------------------------

    result = update_order_status(
        order_id=order_id,
        status="cancelled",
    )

    if not result or result.get("error"):
        return {
            "response": (
                "I couldn't complete the cancellation. "
                "Please contact human support."
            ),
            "order_id": order_id,
            "cancelled": False,
        }

    # --------------------------------------------------------
    # Verify database update
    # --------------------------------------------------------

    updated_order = get_order_status(order_id)
    updated_status = get_status(updated_order)

    if updated_status != "cancelled":
        return {
            "response": (
                "The cancellation could not be confirmed. "
                "Please contact human support."
            ),
            "order": updated_order,
            "order_id": order_id,
            "status": updated_status,
            "cancelled": False,
        }

    return {
        "response": (
            f"Your order {order_id} has been cancelled successfully."
        ),
        "order": updated_order,
        "order_id": order_id,
        "status": updated_status,
        "cancelled": True,
    }


# ============================================================
# 6. REFUND PROCESS
# ============================================================

def process_refund_request(
    customer_id,
    order_id,
    order,
    message,
    conversation,
    recent_messages,
    entities,
    conversation_id=None,
):
    """
    Handle a refund request.

    IMPORTANT:
    The AI does NOT process or approve a refund.

    It verifies that the order exists, then creates
    a human-support handoff for staff review.
    """

    # --------------------------------------------------------
    # Safety check
    # --------------------------------------------------------

    if not order_id:
        return ask_for_order_id()

    # --------------------------------------------------------
    # Order must exist
    # --------------------------------------------------------

    if order is None:
        return {
            "response": (
                "I couldn't find that order. "
                "Please check your order ID and try again."
            ),
            "order_id": order_id,
            "refund_requested": False,
        }

    # --------------------------------------------------------
    # Get latest order information
    # --------------------------------------------------------

    latest_order = get_order_status(order_id)

    if latest_order is None:
        return {
            "response": (
                "I couldn't find that order. "
                "Please check your order ID and try again."
            ),
            "order_id": order_id,
            "refund_requested": False,
        }

    latest_status = get_status(latest_order)
    latest_product = get_product(latest_order)

    # --------------------------------------------------------
    # Build fresh handoff context
    # --------------------------------------------------------

    handoff_context = build_handoff_context(
        conversation=conversation,
        order_id=order_id,
        intent="refund_request",
        order_status=latest_status,
        recent_messages=recent_messages,
        entities=entities,
        conversation_id=conversation_id,
    )

    # --------------------------------------------------------
    # Create human handoff
    # --------------------------------------------------------

    handoff_result = create_handoff(
        customer_id=customer_id,
        message=message,
        reason=(
            "Refund request requires staff review. "
            "No refund has been processed by the AI."
        ),
        context=handoff_context,
    )

    # --------------------------------------------------------
    # Add refund information to result
    # --------------------------------------------------------

    handoff_result.update(
        {
            "refund_requested": True,
            "refund_processed": False,
            "order_id": order_id,
            "product": latest_product,
            "order_status": latest_status,
            "requires_staff_review": True,
        }
    )

    return handoff_result


# ============================================================
# 7. MAIN AGENT
# ============================================================

def process_message(
    intent,
    customer_id=None,
    order_id=None,
    message=None,
    conversation_id=None,
):
    """
    Main AI customer support agent.

    Flow:

    Customer message
        ↓
    Load memory
        ↓
    Recover order ID
        ↓
    Load entities
        ↓
    Load recent messages
        ↓
    Get order from database
        ↓
    Decide action
        ↓
    Order Status / Cancellation / Refund / Handoff / RAG
    """

    started = time.perf_counter()

    # ========================================================
    # STEP 1: LOAD CONVERSATION MEMORY
    # ========================================================

    context = (
        get_conversation_by_customer_from_db(customer_id)
        if customer_id is not None
        else None
    )

    print(
        "Conversation memory loading time: "
        f"{time.perf_counter() - started:.2f}s"
    )

    # ========================================================
    # STEP 2: RECOVER ORDER ID FROM MEMORY
    # ========================================================
    #
    # IMPORTANT:
    #
    # Refund requests must NOT automatically reuse an old
    # order ID from memory.
    #
    # The customer must explicitly provide the order ID
    # for the refund request.
    #
    # This prevents:
    #
    # "I want a refund"
    #
    # from automatically becoming:
    #
    # "Refund order ORD-OLD..."
    #
    # ========================================================

    if (
        not order_id
        and context
        and intent != "refund_request"
    ):
        order_id = context.get("current_order_id")

    # ========================================================
    # STEP 3: LOAD IMPORTANT ENTITIES
    # ========================================================

    entities = (
        get_entities(customer_id)
        if customer_id is not None
        else None
    )

    # --------------------------------------------------------
    # IMPORTANT:
    #
    # Do not recover an old entity order ID for a new refund
    # request.
    # --------------------------------------------------------

    if (
        not order_id
        and entities
        and intent != "refund_request"
    ):
        order_id = entities.get("order_id")

    # ========================================================
    # STEP 4: LOAD RECENT MESSAGES
    # ========================================================

    recent_messages = (
        get_recent_messages(
            customer_id,
            limit=5,
        )
        if customer_id is not None
        else None
    )

    # ========================================================
    # STEP 5: GET ORDER FROM DATABASE
    # ========================================================

    order = (
        get_order_status(order_id)
        if order_id
        else None
    )

    # --------------------------------------------------------
    # If an explicit order ID exists but the order does not
    # exist, do not silently use another order.
    # --------------------------------------------------------

    if order_id and order is None:
        return {
            "response": (
                "I couldn't find that order. "
                "Please check your order ID and try again."
            ),
            "order_id": order_id,
            "found": False,
        }

    order_status = get_status(order)

    # ========================================================
    # STEP 6: DECIDE ACTION
    # ========================================================

    action = decide_action(
        intent=intent,
        order_id=order_id,
        order_status=order_status,
    )

    print("Detected intent:", intent)
    print("Decision action:", action)
    print("Order ID:", order_id)
    print("Order status:", order_status)
    print("Conversation ID:", conversation_id)

    # ========================================================
    # STEP 7: ASK FOR ORDER ID
    # ========================================================

    if action == "ask_for_order_id":

        # Preserve the customer's intent.

        if customer_id is not None:
            update_context(
                customer_id=customer_id,
                current_order_id=order_id,
                current_intent=intent,
            )

        return ask_for_order_id()

    # ========================================================
    # STEP 8: INVALID ORDER
    # ========================================================

    if action == "invalid_order":

        return {
            "response": (
                "I couldn't find that order. "
                "Please check your order ID and try again."
            ),
            "order_id": order_id,
            "found": False,
        }

    # ========================================================
    # STEP 9: UPDATE MEMORY
    # ========================================================

    if customer_id is not None:

        save_memory(
            customer_id=customer_id,
            order_id=order_id,
            intent=intent,
        )

    # ========================================================
    # STEP 10: BUILD HANDOFF CONTEXT
    # ========================================================

    handoff_context = build_handoff_context(
        conversation=context,
        order_id=order_id,
        intent=intent,
        order_status=order_status,
        recent_messages=recent_messages,
        entities=entities,
        conversation_id=conversation_id,
    )

    # ========================================================
    # STEP 11: HUMAN HANDOFF
    # ========================================================

    if action == "human_handoff":

        return create_handoff(
            customer_id=customer_id,
            message=message,
            reason="Customer requested human support",
            context=handoff_context,
        )

    # ========================================================
    # STEP 12: ORDER STATUS
    # ========================================================

    if action == "get_order_status":

        product = get_product(order)

        return {
            "response": (
                f"Your order {order_id} for {product} "
                f"currently has the status: {order_status}."
            ),
            "order": order,
            "order_id": order_id,
            "intent": intent,
        }

    # ========================================================
    # STEP 13: CANNOT CANCEL
    # ========================================================

    if action == "cannot_cancel":

        return {
            "response": (
                "This order cannot be cancelled because "
                f"its current status is {order_status}. "
                "Please contact human support if you need help."
            ),
            "order": order,
            "order_id": order_id,
            "status": order_status,
            "cancelled": False,
        }

    # ========================================================
    # STEP 14: CANCEL ORDER
    # ========================================================

    if action == "check_cancellation":

        result = process_cancel_order(
            order_id=order_id,
            message=message,
            recent_messages=recent_messages,
        )

        # Keep memory consistent after successful cancellation.

        if (
            customer_id is not None
            and result.get("cancelled")
        ):
            save_memory(
                customer_id=customer_id,
                order_id=order_id,
                intent="order_status",
            )

        return result

    # ========================================================
    # STEP 15: REFUND REQUEST
    # ========================================================

    if action == "check_refund":

        return process_refund_request(
            customer_id=customer_id,
            order_id=order_id,
            order=order,
            message=message,
            conversation=context,
            recent_messages=recent_messages,
            entities=entities,
            conversation_id=conversation_id,
        )

    # ========================================================
    # STEP 16: GENERAL QUESTIONS
    # ========================================================

    rag_started = time.perf_counter()

    rag_context = (
        build_rag_context(
            message,
            top_k=3,
        )
        if message
        else ""
    )

    print(
        "RAG response time: "
        f"{time.perf_counter() - rag_started:.2f}s"
    )

    # ========================================================
    # STEP 17: LLM RESPONSE
    # ========================================================

    llm_started = time.perf_counter()

    response = generate_response(
        message=message,
        order=order,
        rag_context=rag_context,
        recent_messages=recent_messages,
    )

    print(
        "LLM response time: "
        f"{time.perf_counter() - llm_started:.2f}s"
    )

    print(
        "LLM response:",
        repr(response),
    )

    # ========================================================
    # STEP 18: RETURN GENERAL RESPONSE
    # ========================================================

    return {
        "response": response,
        "order": order,
        "order_id": order_id,
        "rag_context": rag_context,
        "intent": intent,
    }