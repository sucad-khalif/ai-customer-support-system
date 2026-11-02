from sqlalchemy.orm import Session
from app.database import engine
from app.models import Customer , Order , Conversation , Message, Handoff

# CREAT
# with Session(engine) as session:
#       customer = Customer(
#         name="Ahmed",
#         email="ahmed@example.com"
#     )

#     session.add(customer)
#     session.commit()

#     print("Customer created successfully!")
#     print("Customer ID:", customer.id)

# READ

# with Session(engine) as session:
#     customer = session.get(Customer, 1)

#     print("Customer found!")
#     print("ID:", customer.id)
#     print("Name:", customer.name)
#     print("Email:", customer.email)

# Update
# with Session(engine) as session:
#     customer = session.get(Customer, 1)

#     customer.email = "ahmed2026@example.com"

#     session.commit()

#     print("Customer updated successfully!")
#     print("ID:", customer.id)
#     print("Name:", customer.name)
#     print("Email:", customer.email)

# Delete

# with Session(engine) as session:
#     customer = session.get(Customer, 1)

#     if customer:
#         session.delete(customer)
#         session.commit()

#         print("Customer deleted successfully!")
#     else:
#         print("Customer not found!")


# ==================================================
# ORDER CRUD
# ==================================================

 # CREATE
# with Session(engine) as session:
#     customer = session.query(Customer).first()

#     order = Order(
#         order_id="ORD-1001",
#         customer_id=customer.id,
#         product="Pizza",
#         status="preparing"
#     )

#     session.add(order)
#     session.commit()

#     print("Order created successfully!")
#     print("Order ID:", order.order_id)
#     print("Customer ID:", order.customer_id)
#     print("Product:", order.product)
#     print("Status:", order.status)

# READ
# with Session(engine) as session:
#     order = session.query(Order).filter_by(order_id="ORD-1001").first()

#     print("Order found!")
#     print("Order ID:", order.order_id)
#     print("Customer ID:", order.customer_id)
#     print("Product:", order.product)
#     print("Status:", order.status)

# UPDATE
# with Session(engine) as session:
#     order = session.query(Order).filter_by(order_id="ORD-1001").first()

#     order.status = "shipped"

#     session.commit()

#     print("Order updated successfully!")
#     print("Order ID:", order.order_id)
#     print("Product:", order.product)
#     print("Status:", order.status)

# DELETE
# with Session(engine) as session:
#     order = session.query(Order).filter_by(order_id="ORD-1001").first()

#     if order:
#         session.delete(order)
#         session.commit()

#         print("Order deleted successfully!")
#     else:
#         print("Order not found!")

# ==================================================
# CONVERSATION CRUD
# ==================================================

# CREATE
# with Session(engine) as session:
#     customer = session.query(Customer).first()

#     conversation = Conversation(
#         conversation_id="CONV-001",
#         customer_id=customer.id,
#         current_intent="order_status",
#         state="active"
#     )

#     session.add(conversation)
#     session.commit()

#     print("Conversation created successfully!")
#     print("Conversation ID:", conversation.conversation_id)
#     print("Customer ID:", conversation.customer_id)
#     print("Current Intent:", conversation.current_intent)
#     print("State:", conversation.state)

# READ
# with Session(engine) as session:
#     conversation = (
#         session.query(Conversation)
#         .filter_by(conversation_id="CONV-001")
#         .first()
#     )

#     print("Conversation found!")
#     print("Conversation ID:", conversation.conversation_id)
#     print("Customer ID:", conversation.customer_id)
#     print("Current Intent:", conversation.current_intent)
#     print("State:", conversation.state)

# UPDATE
# with Session(engine) as session:
#     conversation = (
#         session.query(Conversation)
#         .filter_by(conversation_id="CONV-001")
#         .first()
#     )

#     conversation.current_intent = "cancel_order"
#     conversation.state = "cancellation_request"

#     session.commit()

#     print("Conversation updated successfully!")
#     print("Conversation ID:", conversation.conversation_id)
#     print("Current Intent:", conversation.current_intent)
#     print("State:", conversation.state)

# DELETE
# with Session(engine) as session:
#     conversation = (
#         session.query(Conversation)
#         .filter_by(conversation_id="CONV-001")
#         .first()
#     )

#     if conversation:
#         session.delete(conversation)
#         session.commit()

#         print("Conversation deleted successfully!")
#     else:
#         print("Conversation not found!")


# ==============================
# MESSAGE CRUD
# ==============================

# CREATE
# with Session(engine) as session:
#     conversation = session.query(Conversation).first()

#     if conversation:
#         message = Message(
#             conversation_id=conversation.id,
#             role="customer",
#             content="Where is my order?"
#         )

#         session.add(message)
#         session.commit()

    #     print("Message created successfully!")
    #     print("Message ID:", message.id)
    #     print("Conversation ID:", message.conversation_id)
    #     print("Role:", message.role)
    #     print("Content:", message.content)
    # else:
    #     print("No conversation found!")

# READ
# with Session(engine) as session:
#     message = session.query(Message).first()

#     if message:
#         print("Message found!")
#         print("Message ID:", message.id)
#         print("Conversation ID:", message.conversation_id)
#         print("Role:", message.role)
#         print("Content:", message.content)
#     else:
#         print("Message not found!")

# UPDATE
# with Session(engine) as session:
#     message = session.query(Message).first()

#     if message:
#         message.content = "Where is my pizza order?"
#         session.commit()

#         print("Message updated successfully!")
#         print("Message ID:", message.id)
#         print("New Content:", message.content)
#     else:
#         print("Message not found!")

# DELETE
# with Session(engine) as session:
#     message = session.query(Message).first()

#     if message:
#         session.delete(message)
#         session.commit()

#         print("Message deleted successfully!")
#     else:
#         print("Message not found!")

# ==============================
# HANDOFF CRUD
# ==============================

# CREATE
# with Session(engine) as session:
#     customer = session.query(Customer).first()
#     conversation = session.query(Conversation).first()
#     order = session.query(Order).first()

#     if customer and conversation:
#         handoff = Handoff(
#             customer_id=customer.id,
#             conversation_id=conversation.id,
#             order_id=order.id if order else None,
#             reason="Customer requested human support",
#             status="waiting_for_human_support"
#         )

#         session.add(handoff)
#         session.commit()

#         print("Handoff created successfully!")
#         print("Handoff ID:", handoff.id)
#         print("Customer ID:", handoff.customer_id)
#         print("Conversation ID:", handoff.conversation_id)
#         print("Order ID:", handoff.order_id)
#         print("Reason:", handoff.reason)
#         print("Status:", handoff.status)
#     else:
#         print("Customer or conversation not found!")

# READ
# with Session(engine) as session:
#     handoff = session.query(Handoff).first()

#     if handoff:
#         print("Handoff found!")
#         print("Handoff ID:", handoff.id)
#         print("Customer ID:", handoff.customer_id)
#         print("Conversation ID:", handoff.conversation_id)
#         print("Order ID:", handoff.order_id)
#         print("Reason:", handoff.reason)
#         print("Status:", handoff.status)
#     else:
#         print("Handoff not found!")

# UPDATE
# with Session(engine) as session:
#     handoff = session.query(Handoff).first()

#     if handoff:
#         handoff.status = "resolved"
#         session.commit()

#         print("Handoff updated successfully!")
#         print("Handoff ID:", handoff.id)
#         print("New Status:", handoff.status)
#     else:
#         print("Handoff not found!")

# # DELETE
# with Session(engine) as session:
#     handoff = session.query(Handoff).first()

#     if handoff:
#         session.delete(handoff)
#         session.commit()

#         print("Handoff deleted successfully!")
#     else:
#         print("Handoff not found!")