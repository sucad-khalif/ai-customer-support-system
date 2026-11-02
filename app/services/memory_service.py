
from sqlalchemy.orm import Session

from app.database import engine
from app.models import Conversation, Message, Handoff

# Stores conversation history for customers

conversation_history = {
    123:{
        "conversation_id":"CONV-001",
        "messages":[],
        "current_order_id":"ORD-1001",
        "current_intent":"order_status",
        "conversation_state": "active",
        "important_entities":{
            "order_id":"ORD-1001"
        }

    }
}


def save_message(customer_id, conversation_id, role, message):

    # ==========================================
    # 1. SAVE MESSAGE IN MEMORY
    # ==========================================

    if customer_id not in conversation_history:
        conversation_history[customer_id] = {
            "conversation_id": conversation_id,
            "messages": [],
            "current_order_id": None,
            "current_intent": None,
            "conversation_state": "active",
            "important_entities": {}
        }

    conversation_history[customer_id]["messages"].append({
        "role": role,
        "message": message
    })


    # ==========================================
    # 2. SAVE MESSAGE IN POSTGRESQL
    # ==========================================

    with Session(engine) as session:

        conversation = (
            session.query(Conversation)
            .filter_by(
                conversation_id=conversation_id
            )
            .first()
        )

        if conversation is None:
            raise ValueError(
                f"Conversation {conversation_id} not found"
            )

        if conversation.customer_id != customer_id:
            raise ValueError(
                "Conversation does not belong to this customer"
            )

        new_message = Message(
            conversation_id=conversation.id,
            role=role,
            content=message
        )

        session.add(new_message)
        session.commit()
        session.refresh(new_message)

        return {
            "id": new_message.id,
            "conversation_id": conversation_id,
            "role": role,
            "message": message
        }


def get_history(customer_id):

    return conversation_history.get(
        customer_id,
        None
    )


def clear_history(customer_id):

    if customer_id in conversation_history:
        del conversation_history[customer_id]

def update_context(
    customer_id,
    current_order_id=None,
    current_intent=None,
    important_entities=None
):

    if customer_id not in conversation_history:
        return False

    if current_order_id is not None:
        conversation_history[customer_id]["current_order_id"] = current_order_id

    if current_intent is not None:
        conversation_history[customer_id]["current_intent"] = current_intent

    if important_entities is not None:
        conversation_history[customer_id]["important_entities"].update(
            important_entities
        )

    return True
def update_conversation_state(customer_id, state):

    if customer_id not in conversation_history:
        return False

    conversation_history[customer_id]["conversation_state"] = state

    return True
#function Entities
def update_entities(customer_id, entities):

    if customer_id not in conversation_history:
        return False

    conversation_history[customer_id]["important_entities"].update(
        entities
    )

    return True

#Retrieval Entity
def get_entities(customer_id):

    if customer_id not in conversation_history:
        return None

    return conversation_history[customer_id]["important_entities"]

 # Test

if __name__ == "__main__":

    save_message(
        customer_id=123,
        conversation_id="CONV-001",
        role="customer",
        message="Where is my order?"
    )

    save_message(
        customer_id=123,
        conversation_id="CONV-001",
        role="assistant",
        message="Your pizza is currently being prepared."
    )

    print("\nConversation History:")
    print(conversation_history)

    update_context(
    customer_id=123,
    current_order_id="ORD-1001",
    current_intent="cancel_order",
    important_entities={
        "order_id": "ORD-1001"
    }
)

print("\nUpdated Conversation:")
print(get_history(123))

def get_context(customer_id):

    if customer_id not in conversation_history:
        return None

    return {
        "conversation_id": conversation_history[customer_id]["conversation_id"],
        "current_order_id": conversation_history[customer_id]["current_order_id"],
        "current_intent": conversation_history[customer_id]["current_intent"],
        "important_entities": conversation_history[customer_id]["important_entities"]
    }
print("\nCurrent Context:")
print(get_context(123))

print("\nUpdating Conversation State:")

update_conversation_state(
    customer_id=123,
    state="cancellation_request"
)

print(get_history(123))

# Context Window

def get_recent_messages(customer_id, limit=5):

    if customer_id not in conversation_history:
        return None

    messages = conversation_history[customer_id]["messages"]

    return messages[-limit:]

#Test Entity
print("\nUpdating Entities:")

update_entities(
    customer_id=123,
    entities={
        "product": "Pizza",
        "customer_name": "Ahmed"
    }
)

print(get_history(123))
# Entity retreive
print("\nRetrieved Entities:")

entities = get_entities(123)

print(entities)

#Test context window 
print("\n--- CONTEXT WINDOW TEST ---")

conversation_history[123]["messages"] = [
    {"role": "customer", "message": "Message 1"},
    {"role": "assistant", "message": "Message 2"},
    {"role": "customer", "message": "Message 3"},
    {"role": "assistant", "message": "Message 4"},
    {"role": "customer", "message": "Message 5"},
    {"role": "assistant", "message": "Message   6"}
]

recent_messages = get_recent_messages(
    customer_id=123,
    limit=3
)

print("\nRecent 3 Messages:")
print(recent_messages)


# FROM RAM TO POSTGRESQL
def get_conversation_from_db(conversation_id):
    with Session(engine) as session:
        conversation = (
            session.query(Conversation)
            .filter_by(conversation_id=conversation_id)
            .first()
        )

        if conversation is None:
            return None

        return {
            "conversation_id": conversation.conversation_id,
            "customer_id": conversation.customer_id,
            "current_intent": conversation.current_intent,
            "state": conversation.state
        }

    if __name__ == "__main__":
        print("\nDatabase Conversation Test:")

conversation = get_conversation_from_db("CONV-001")

print(conversation)

# get message from db
def get_messages_from_db(conversation_id):

    with Session(engine) as session:

        conversation = (
            session.query(Conversation)
            .filter_by(conversation_id=conversation_id)
            .first()
        )

        if conversation is None:
            return None

        messages = (
            session.query(Message)
            .filter_by(conversation_id=conversation.id)
            .all()
        )

        return [
            {
                "role": message.role,
                "message": message.content
            }
            for message in messages
        ]
    if __name__ == "__main__":
        print("\nDatabase Messages Test:")

messages = get_messages_from_db("CONV-001")

print(messages)

# get HAND-OFF from database 
def get_handoff_from_db(customer_id):

    with Session(engine) as session:

        handoff = (
            session.query(Handoff)
            .filter_by(customer_id=customer_id)
            .order_by(Handoff.id.desc())
            .first()
        )

        if handoff is None:
            return None

        return {
            "handoff_id": handoff.id,
            "customer_id": handoff.customer_id,
            "conversation_id": handoff.conversation_id,
            "order_id": handoff.order_id,
            "reason": handoff.reason,
            "status": handoff.status
        }
    if __name__ == "__main__":
        print("\nDatabase Handoff Test:")

handoff = get_handoff_from_db(1)

print(handoff)


# get customer before conversation 

def get_conversation_by_customer_from_db(customer_id):

    with Session(engine) as session:

        conversation = (
            session.query(Conversation)
            .filter_by(customer_id=customer_id)
            .order_by(Conversation.id.desc())
            .first()
        )

        if conversation is None:
            return None

        return {
            "conversation_id": conversation.conversation_id,
            "customer_id": conversation.customer_id,
            "current_order_id": conversation.current_order_id,
            "current_intent": conversation.current_intent,
            "state": conversation.state
        }
    if __name__ == "__main__":
        print("\nConversation by Customer Test:")

conversation = get_conversation_by_customer_from_db(1)

print(conversation)
