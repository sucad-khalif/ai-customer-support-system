from sqlalchemy.orm import Session

from app.database import engine
from app.models import (
    Handoff,
    Customer,
    Conversation,
    Order,
)


# ==================================================
# 1. DETERMINE HANDOFF REASON
# ==================================================

def determine_handoff_reason(message):
    """
    Determine why the customer needs human support.
    """

    message_lower = message.lower()

    if (
        "could not answer" in message_lower
        or "couldn't answer" in message_lower
        or "not helping" in message_lower
        or "cannot help" in message_lower
        or "can't help" in message_lower
    ):
        return "AI could not provide sufficient information"

    return "Customer requested human support"


# ==================================================
# 2. CREATE CUSTOMER-FACING RESPONSE
# ==================================================

def create_handoff_response():
    """
    Create the message that the customer will see
    after a human handoff is created.
    """

    return (
        "Your request has been forwarded to our "
        "support team. A human agent will assist "
        "you shortly."
    )


# ==================================================
# 3. CREATE HANDOFF
# ==================================================

def create_handoff(
    customer_id,
    message,
    reason,
    context,
):
    """
    Create a human handoff and save it in the database.
    """

    # ----------------------------------------------
    # Determine reason
    # ----------------------------------------------

    if not reason:
        reason = determine_handoff_reason(message)

    # ----------------------------------------------
    # Get conversation and order IDs
    # ----------------------------------------------

    conversation_id = context.get("conversation_id")
    order_id = context.get("order_id")

    # ----------------------------------------------
    # Customer-facing response
    # ----------------------------------------------

    response = create_handoff_response()

    # ----------------------------------------------
    # Database session
    # ----------------------------------------------

    with Session(engine) as session:

        # ==========================================
        # Find customer
        # ==========================================

        customer = (
            session.query(Customer)
            .filter_by(id=customer_id)
            .first()
        )

        if not customer:
            raise ValueError(
                f"Customer {customer_id} not found"
            )

        # ==========================================
        # Find conversation
        # ==========================================

        conversation = (
            session.query(Conversation)
            .filter_by(
                conversation_id=conversation_id
            )
            .first()
        )

        if not conversation:
            raise ValueError(
                f"Conversation {conversation_id} not found"
            )

        # ==========================================
        # Verify conversation belongs to customer
        # ==========================================

        if conversation.customer_id != customer.id:
            raise ValueError(
                "Conversation does not belong to this customer"
            )

        # ==========================================
        # Find order
        # ==========================================

        order = None

        if order_id:

            order = (
                session.query(Order)
                .filter_by(order_id=order_id)
                .first()
            )

            if not order:
                raise ValueError(
                    f"Order {order_id} not found"
                )

            # Make sure order belongs to customer
            if order.customer_id != customer.id:
                raise ValueError(
                    "Order does not belong to this customer"
                )

        # ==========================================
        # Create database handoff
        # ==========================================

        handoff = Handoff(
            customer_id=customer.id,
            conversation_id=conversation.id,
            order_id=order.id if order else None,
            reason=reason,
            status="waiting_for_human_support",
        )

        session.add(handoff)
        session.commit()
        session.refresh(handoff)

        # ==========================================
        # Return handoff result
        # ==========================================

        return {
            "handoff": True,
            "handoff_id": handoff.id,
            "customer_id": customer.id,
            "message": message,
            "response": response,
            "reason": reason,
            "context": context,
            "status": handoff.status,
        }


# ==================================================
# 4. UPDATE HANDOFF STATUS
# ==================================================

def update_handoff_status(
    handoff_id,
    new_status,
):
    """
    Update the status of an existing database handoff.
    """

    with Session(engine) as session:

        handoff = (
            session.query(Handoff)
            .filter_by(id=handoff_id)
            .first()
        )

        if not handoff:
            return None

        handoff.status = new_status

        session.commit()
        session.refresh(handoff)

        return {
            "handoff_id": handoff.id,
            "status": handoff.status,
        }