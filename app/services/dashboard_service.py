from sqlalchemy.orm import Session
import uuid
from app.database import engine
from app.models import Customer, Order, Handoff, Conversation, Message , OrderItem


def get_dashboard_stats():
    with Session(engine) as session:
        customers = session.query(Customer).count()
        orders = session.query(Order).count()
        handoffs = session.query(Handoff).count()

        return {
            "customers": customers,
            "orders": orders,
            "handoffs": handoffs
        }

# Get order recent
def get_recent_orders():
    with Session(engine) as session:
        orders = (
            session.query(Order)
            .order_by(Order.id.desc())
            .limit(5)
            .all()
        )

        return [
    {
        "order_id": order.order_id,
        "customer_name": (
            session.query(Customer)
            .filter_by(id=order.customer_id)
            .first()
            .name
        ),
        "product": order.product,
        "status": order.status
    }
    for order in orders
]

# get recent handoff
def get_recent_handoffs():
    with Session(engine) as session:
        handoffs = (
            session.query(Handoff)
            .order_by(Handoff.id.desc())
            .limit(5)
            .all()
        )

        return [
            {
                "customer_name": (
                    session.query(Customer)
                    .filter_by(id=handoff.customer_id)
                    .first()
                    .name
                ),
                "reason": handoff.reason,
                "status": handoff.status
            }
            for handoff in handoffs
        ]

# Get customers
def get_customers():
    with Session(engine) as session:
        customers = (
            session.query(Customer)
            .order_by(Customer.id.desc())
            .all()
        )

        return [
            {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email
            }
            for customer in customers
        ]

#get conversation
def get_conversations():
    with Session(engine) as session:
        conversations = (
            session.query(Conversation)
            .order_by(Conversation.id.desc())
            .all()
        )

        return [
            {
                "conversation_id": conversation.conversation_id,
                "customer_name": (
                    session.query(Customer)
                    .filter_by(id=conversation.customer_id)
                    .first()
                    .name
                ),
                "current_order_id": conversation.current_order_id,
                "current_intent": conversation.current_intent,
                "state": conversation.state
            }
            for conversation in conversations
        ]

# Get Handoffs
def get_handoffs():
    with Session(engine) as session:
        handoffs = (
            session.query(Handoff)
            .order_by(Handoff.id.desc())
            .all()
        )

        return [
            {
                "handoff_id": handoff.id,
                "customer_name": (
                    session.query(Customer)
                    .filter_by(id=handoff.customer_id)
                    .first()
                    .name
                ),
                "conversation_id": (
                    session.query(Conversation)
                    .filter_by(id=handoff.conversation_id)
                    .first()
                    .conversation_id
                ),
                "order_id": (
                    session.query(Order)
                    .filter_by(id=handoff.order_id)
                    .first()
                    .order_id
                    if handoff.order_id
                    else None
                ),
                "reason": handoff.reason,
                "status": handoff.status
            }
            for handoff in handoffs
        ]

# Resolved
def resolve_handoff(handoff_id):
    with Session(engine) as session:
        handoff = (
            session.query(Handoff)
            .filter_by(id=handoff_id)
            .first()
        )

        if not handoff:
            return None

        handoff.status = "resolved"
        session.commit()

        return {
            "handoff_id": handoff.id,
            "status": handoff.status
        }

#messages

def get_handoff_details(handoff_id):
    with Session(engine) as session:
        handoff = (
            session.query(Handoff)
            .filter_by(id=handoff_id)
            .first()
        )

        if not handoff:
            return None

        conversation = (
            session.query(Conversation)
            .filter_by(id=handoff.conversation_id)
            .first()
        )

        customer = (
            session.query(Customer)
            .filter_by(id=handoff.customer_id)
            .first()
        )

        order = (
            session.query(Order)
            .filter_by(id=handoff.order_id)
            .first()
            if handoff.order_id
            else None
        )

        messages = (
            session.query(Message)
            .filter_by(conversation_id=handoff.conversation_id)
            .order_by(Message.id.asc())
            .all()
        )

        return {
            "handoff_id": handoff.id,
            "customer_name": customer.name if customer else None,
            "conversation_id": (
                conversation.conversation_id
                if conversation
                else None
            ),
            "order_id": order.order_id if order else None,
            "reason": handoff.reason,
            "status": handoff.status,
            "messages": [
                {
                    "role": message.role,
                    "content": message.content
                }
                for message in messages
            ]
        }

def get_customer_details(customer_id):
    with Session(engine) as session:
        customer = (
            session.query(Customer)
            .filter_by(id=customer_id)
            .first()
        )

        if not customer:
            return None

        orders = (
            session.query(Order)
            .filter_by(customer_id=customer.id)
            .order_by(Order.id.desc())
            .all()
        )

        conversations = (
            session.query(Conversation)
            .filter_by(customer_id=customer.id)
            .order_by(Conversation.id.desc())
            .all()
        )

        return {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "orders": [
                {
                    "order_id": order.order_id,
                    "product": order.product,
                    "status": order.status
                }
                for order in orders
            ],
            "conversations": [
                {
                    "conversation_id": conversation.conversation_id,
                    "current_order_id": conversation.current_order_id,
                    "current_intent": conversation.current_intent,
                    "state": conversation.state
                }
                for conversation in conversations
            ]
        }

def get_order_details(order_id):
    with Session(engine) as session:
        order = (
            session.query(Order)
            .filter_by(order_id=order_id)
            .first()
        )

        if not order:
            return None

        customer = (
            session.query(Customer)
            .filter_by(id=order.customer_id)
            .first()
        )

        return {
            "order_id": order.order_id,
            "customer_name": customer.name if customer else None,
            "customer_email": customer.email if customer else None,
            "product": order.product,
            "status": order.status
        }

def get_conversation_details(conversation_id):
    with Session(engine) as session:

        # ==========================================
        # 1. Find conversation
        # ==========================================

        conversation = (
            session.query(Conversation)
            .filter_by(
                conversation_id=conversation_id
            )
            .first()
        )

        if not conversation:
            return None

        # ==========================================
        # 2. Find customer
        # ==========================================

        customer = (
            session.query(Customer)
            .filter_by(
                id=conversation.customer_id
            )
            .first()
        )

        # ==========================================
        # 3. Get latest 5 messages
        # ==========================================

        latest_messages = (
            session.query(Message)
            .filter_by(
                conversation_id=conversation.id
            )
            .order_by(Message.id.desc())
            .limit(5)
            .all()
        )

        # ==========================================
        # 4. Reverse them for chronological order
        # ==========================================

        latest_messages.reverse()

        # ==========================================
        # 5. Return conversation details
        # ==========================================

        return {
            "conversation_id": conversation.conversation_id,
            "customer_name": (
                customer.name
                if customer
                else None
            ),
            "customer_email": (
                customer.email
                if customer
                else None
            ),
            "current_order_id": (
                conversation.current_order_id
            ),
            "current_intent": (
                conversation.current_intent
            ),
            "state": conversation.state,

            "messages": [
                {
                    "role": message.role,
                    "content": message.content
                }
                for message in latest_messages
            ]
        }
# Kaydinta orders ka cusub 



def create_order(customer_id, product=None, items=None):
    with Session(engine) as session:
        customer = (
            session.query(Customer)
            .filter_by(id=customer_id)
            .first()
        )

        if not customer:
            return None

        # Support the existing single-product order API.
        if items is None:
            if not product:
                return None

            items = [
                {
                    "product_name": product,
                    "quantity": 1,
                    "unit_price": 0
                }
            ]

        if not items:
            return None

        new_order = Order(
            order_id=f"ORD-{uuid.uuid4().hex[:8].upper()}",
            customer_id=customer_id,
            product=", ".join(
                item["product_name"] for item in items
            ),
            status="pending"
        )

        try:
            session.add(new_order)
            session.flush()

            order_items = []

            for item in items:
                quantity = item["quantity"]
                unit_price = item["unit_price"]

                if (
                    not isinstance(quantity, int)
                    or isinstance(quantity, bool)
                    or quantity < 1
                ):
                    raise ValueError("Quantity must be a positive integer")

                if unit_price < 0:
                    raise ValueError("Price cannot be negative")

                order_item = OrderItem(
                    order_id=new_order.id,
                    product_name=item["product_name"],
                    quantity=quantity,
                    unit_price=unit_price
                )

                session.add(order_item)

                order_items.append({
                    "product_name": item["product_name"],
                    "quantity": quantity,
                    "unit_price": float(unit_price),
                    "subtotal": round(
                        quantity * float(unit_price), 2
                    )
                })

            session.commit()
            session.refresh(new_order)

            return {
                "order_id": new_order.order_id,
                "customer_id": new_order.customer_id,
                "product": new_order.product,
                "items": order_items,
                "total": round(
                    sum(item["subtotal"] for item in order_items), 2
                ),
                "status": new_order.status
            }

        except Exception:
            session.rollback()
            raise

# Update order_status
def update_order_status(order_id: str, status: str):
    allowed_statuses = {
        "pending",
        "preparing",
        "shipped",
        "delivered",
        "cancelled"
    }

    if status not in allowed_statuses:
        return {"error": "Invalid order status"}

    with Session(engine) as session:
        order = (
            session.query(Order)
            .filter_by(order_id=order_id)
            .first()
        )

        if order is None:
            return None

        order.status = status
        session.commit()
        session.refresh(order)

        return {
            "order_id": order.order_id,
            "customer_id": order.customer_id,
            "product": order.product,
            "status": order.status
        }