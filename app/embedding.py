from ollama import embed
from app.chunking import create_knowledge_chunks


def create_embeddings(chunks):

    embeddings = []

    for chunk in chunks:

        response = embed(
            model="nomic-embed-text",
            input=chunk["content"]
        )

        vector = response["embeddings"][0]

        embeddings.append({
            "file": chunk["file"],
            "category": chunk["category"],
            "chunk_id": chunk["chunk_id"],
            "content": chunk["content"],
            "embedding": vector
        })

    return embeddings


if __name__ == "__main__":

    chunks = create_knowledge_chunks()

    embedded_chunks = create_embeddings(chunks)

    print("Number of chunks:", len(embedded_chunks))

    print("Embedding length:", len(
        embedded_chunks[0]["embedding"]
    ))

    print("\nFirst 10 values:")
    print(embedded_chunks[0]["embedding"][:10])