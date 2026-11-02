from sqlalchemy import Column, Integer, String, ForeignKey,Numeric
from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)


#Staff
class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="staff")
    is_active = Column(Integer, nullable=False, default=1)
    
# Orders
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    order_id = Column(String(50), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    product = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False)

# Conversation

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True)
    conversation_id = Column(String(50), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    current_intent = Column(String(100), nullable=True)
    current_order_id = Column(String(50), nullable=True)
    state = Column(String(50), nullable=True)

# Messages

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    conversation_id = Column(
        Integer,
        ForeignKey("conversations.id"),
        nullable=False
    )
    role = Column(String(20), nullable=False)
    content = Column(String(1000), nullable=False)

    # Hand-off

class Handoff(Base):
    __tablename__ = "handoffs"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    reason = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False)

# Order_items
# Order Items
class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)

    order_id = Column(
        Integer,
        ForeignKey("orders.id"),
        nullable=False
    )

    product_name = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)