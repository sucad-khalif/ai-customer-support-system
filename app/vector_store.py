import chromadb

from app.embedding import create_embeddings

from app.chunking import create_knowledge_chunks

from ollama import embed



client = chromadb.PersistentClient(
    path="../chroma_db"
)


collection = client.get_or_create_collection(
    name="customer_support_knowledge"
)


def store_embeddings(embedded_chunks):

    ids = []
    documents = []
    embeddings = []
    metadatas = []

    for chunk in embedded_chunks:

        ids.append(
            f"{chunk['category']}_{chunk['file']}_{chunk['chunk_id']}"
        )

        documents.append(
            chunk["content"]
        )

        embeddings.append(
            chunk["embedding"]
        )

        metadatas.append({
            "file": chunk["file"],
            "category": chunk["category"],
            "chunk_id": chunk["chunk_id"]
        })

    collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas
    )



# Test for existing ids, metadata,document,embedding length
# if __name__ == "__main__":

#     results = collection.get(
#         limit=1,
#         include=["documents", "metadatas", "embeddings"]
#     )

#     print("ID:")
#     print(results["ids"][0])

#     print("\nDocument:")
#     print(results["documents"][0])

#     print("\nMetadata:")
#     print(results["metadatas"][0])

#     print("\nEmbedding length:")
#     print(len(results["embeddings"][0]))

#customer question to embeded
def create_query_embedding(query):

    response = embed(
        model="nomic-embed-text",
        input=query
    )

    return response["embeddings"][0]




# ii keen suasha customerka 3 da jawaab ugu macnaha dhaw
def semantic_search(query, top_k=3):

    query_embedding = create_query_embedding(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    clean_results = []

    for i in range(len(results["documents"][0])):

        clean_results.append({
            "content": results["documents"][0][i],
            "file": results["metadatas"][0][i]["file"],
            "category": results["metadatas"][0][i]["category"],
            "distance": results["distances"][0][i]
        })

    return clean_results

#TEST

# if __name__ == "__main__":

#     query = "Can I stop my order before it is shipped?"

#     results = semantic_search(query, top_k=3)

#     print("\nClean Semantic Search Results:")

#     for i, result in enumerate(results, start=1):

#         print("\n==============================")

#         print("Result:", i)
#         print("File:", result["file"])
#         print("Category:", result["category"])
#         print("Distance:", result["distance"])

#         print("\nContent:")
#         print(result["content"])

#to get knowledge to the Agent
def get_relevant_knowledge(query, top_k=3):

    results = semantic_search(query, top_k=top_k)

    knowledge = []

    for result in results:
        knowledge.append(result["content"])

    return knowledge

# Hal context RAG ee jawaabta sida ee LLM u diraya

def build_rag_context(query, top_k=3):

    knowledge = get_relevant_knowledge(
        query,
        top_k=top_k
    )

    if not knowledge:
        return ""

    context = "\n\n".join(knowledge)

    return context

#Test get relevant
# if __name__ == "__main__":

#     query = "Can I stop my order before it is shipped?"

#     knowledge = get_relevant_knowledge(
#         query,
#         top_k=3
#     )

#     print("\nRelevant Knowledge:")

#     for i, content in enumerate(knowledge, start=1):

#         print("\n==============================")
#         print("Knowledge:", i)
#         print(content)

#Test RAG Context
if __name__ == "__main__":

    query = "Can I stop my order before it is shipped?"

    context = build_rag_context(
        query,
        top_k=3
    )

    print("\nRAG Context:")
    print("\n==============================")
    print(context)