from pathlib import Path
KNOWLEDGE_BASE_PATH = Path(__file__).parent / "knowledge_base"

def load_document(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()

if __name__ == "__main__":
    file_path = KNOWLEDGE_BASE_PATH / "policies" / "cancellation.txt"

    content = load_document(file_path)

    print(content)

def load_all_documents():
    documents = []

    for file_path in KNOWLEDGE_BASE_PATH.rglob("*.txt"):
        content = load_document(file_path)

        category = file_path.parent.name

        documents.append({
            "file": file_path.name,
            "category": category,
            "content": content
        })

    return documents
# to get knowledge base the agent

def get_knowledge_base():
    return load_all_documents()

# Test
if __name__ == "__main__":
    knowledge_base = get_knowledge_base()

    print(f"Knowledge base contains: {len(knowledge_base)} documents")

# if __name__ == "__main__":
#     documents = load_all_documents()

#     print(f"Total documents: {len(documents)}")

#     for document in documents:
#         print(
#             f"{document['category']} → {document['file']}"
#         )