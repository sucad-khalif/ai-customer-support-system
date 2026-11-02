import chromadb
from sentence_transformers import SentenceTransformer


client = chromadb.PersistentClient(
    path="chroma_db"
)

collection = client.get_collection(
    name="refund_policy"
)

model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)


def search_refund_policy(question):

    query_embedding = model.encode(
        [question]
    ).tolist()

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=1
    )

    return results["documents"][0][0]


if __name__ == "__main__":

    question = "What is your refund policy?"

    result = search_refund_policy(question)

    print("\nQuestion:")
    print(question)

    print("\nRelevant refund policy:")
    print(result)