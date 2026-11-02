from sqlalchemy.orm import Session

from app.database import engine
from app.models import Order, Customer


def get_order_status(order_id):
    with Session(engine) as session:
        order = (
            session.query(Order)
            .filter_by(order_id=order_id)
            .first()
        )

        if order is None:
            return None

        customer = session.get(Customer, order.customer_id)

        return {
            "order_id": order.order_id,
            "customer_id": order.customer_id,
            "customer_name": customer.name if customer else None,
            "product": order.product,
            "status": order.status
        }