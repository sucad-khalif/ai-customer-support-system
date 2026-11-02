import chromadb
from sentence_transformers import SentenceTransformer
from chunking import create_chunks


client = chromadb.PersistentClient(
   path="app/chroma_db"
)

collection = client.get_or_create_collection(
    name="refund_policy"
)


with open(
    "app/documents/refund_policy.txt",
    "r",
    encoding="utf-8"
) as file:
    text = file.read()


chunks = create_chunks(text)


policy_chunks = [
    chunk for chunk in chunks
    if chunk != "REFUND POLICY"
]


model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)


embeddings = model.encode(policy_chunks)


collection.add(
    ids=[f"refund_policy_{i}" for i in range(len(policy_chunks))],
    documents=policy_chunks,
    embeddings=embeddings.tolist()
)


print("Refund policy stored successfully!")
print("Total refund documents:", collection.count())