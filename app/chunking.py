from app.knowledge_loader import get_knowledge_base


def create_chunks(text: str, chunk_size: int = 500, overlap: int = 50):

    if not text:
        return []

    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    chunks = []

    start = 0

    while start < len(text):

        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start = end - overlap

    return chunks


def create_knowledge_chunks():

    knowledge_base = get_knowledge_base()

    all_chunks = []

    for document in knowledge_base:

        chunks = create_chunks(
            document["content"],
            chunk_size=500,
            overlap=50
        )

        for index, chunk in enumerate(chunks, start=1):

            all_chunks.append({
                "file": document["file"],
                "category": document["category"],
                "chunk_id": index,
                "content": chunk
            })

    return all_chunks


if __name__ == "__main__":

    chunks = create_knowledge_chunks()

    print("Total chunks:", len(chunks))

    for chunk in chunks[:5]:

        print("\n==============================")
        print("File:", chunk["file"])
        print("Category:", chunk["category"])
        print("Chunk ID:", chunk["chunk_id"])
        print("Content:")
        print(chunk["content"])