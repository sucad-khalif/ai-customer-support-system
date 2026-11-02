
from ollama import chat


def generate_response(message, order, rag_context, recent_messages=None):
    prompt = f"""
You are an AI customer support assistant.

Answer the customer's message using ONLY the information provided
in the customer message, order information, company policy, and
recent conversation.

Customer message:
{message}

Order information:
{order}

Relevant company policy:
{rag_context}

Recent conversation:
{recent_messages}

IMPORTANT RULES:
1. Do NOT invent or assume any information.
2. Do NOT assume that the customer has or has not placed an order.
3. Do NOT assume the customer's order status unless it is provided.
4. Do NOT invent refund conditions, fees, delivery times, or policies.
5. If order information is None, do not make assumptions about the order.
6. Use the provided policy directly when answering the customer.
7. If the policy does not provide enough information, explain politely
   that human support may be needed.
8. Keep the response short, natural, polite, and professional.
9. Do not explain your reasoning or display your thinking process.
10. Respond directly to the customer.
11. If the customer asks multiple questions, answer each clearly.
12. When order status information is available, use it first.
13. If the customer asks for help with an order but no order ID or
    order information is available, politely ask for the order ID.
14. Do not recommend human support unless it is necessary.

Provide only the final customer-facing response.
"""

    
    response = chat(
        model="qwen3:4b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        think=False,
        options={
            "num_predict": 150,
            "temperature": 0.2
        }
    )

    print("OLLAMA CONTENT:", repr(response.message.content))
    print("OLLAMA DONE REASON:", response.done_reason)

    answer = response.message.content.strip()

    if not answer:
      answer = (
        "Of course! Please provide your order ID "
        "so I can check your order for you."
    )

    return answer


if __name__ == "__main__":
    result = generate_response(
        message="I want to cancel my order",
        order={
            "product": "Laptop",
            "status": "preparing"
        },
        rag_context=(
            "Orders that have entered preparation "
            "cannot be cancelled."
        ),
        recent_messages=None
    )

    print("\nFINAL RESPONSE:")
    print(result)