import chromadb
from sentence_transformers import SentenceTransformer


client = chromadb.PersistentClient(
    path="../chroma_db"
)

collection = client.get_or_create_collection(
    name="cancellation_policy"
)

refund_collection = client.get_or_create_collection(
    name="refund_policy"
)

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


def search_policy(question):

    query_embedding = model.encode(
        [question]
    )

    results = collection.query(
        query_embeddings=query_embedding.tolist(),
        n_results=1
    )

    if not results["documents"] or not results["documents"][0]:
        return "No cancellation policy found."

    return results["documents"][0][0]


def search_refund_policy(question):

    query_embedding = model.encode(
        [question]
    ).tolist()

    results = refund_collection.query(
        query_embeddings=query_embedding,
        n_results=1
    )

    if not results["documents"] or not results["documents"][0]:
        return "No refund policy found."

    return results["documents"][0][0]


if __name__ == "__main__":

    print("\n--- DATABASE CHECK ---")

    print(
        "Cancellation documents:",
        collection.count()
    )

    print(
        "Refund documents:",
        refund_collection.count()
    )

    print("\n--- CANCELLATION SEARCH ---")

    print(
        search_policy(
            "Can I cancel my order while it is being prepared?"
        )
    )

    print("\n--- REFUND SEARCH ---")

    print(
        search_refund_policy(
            "What is your refund policy?"
        )
    )