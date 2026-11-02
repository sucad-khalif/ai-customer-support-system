from knowledge_loader import get_knowledge_base
import string

def search_knowledge(query):
    knowledge_base = get_knowledge_base()
    keywords = get_keywords(query)

    results = []

    for document in knowledge_base:
        content = document["content"].lower()

        score = 0

        for keyword in keywords:
            if keyword in content:
                score += 1

        if score > 0:
            results.append({
                "document": document,
                "score": score
            })
            results.sort(
    key=lambda result: (
        result["score"],
        result["document"]["category"] == "policies"
    ),
    reverse=True
)

    return results[:3] 

    



#keywords search
STOP_WORDS = {
    "i",
    "want",
    "to",
    "my",
    "the",
    "a",
    "an",
    "is",
    "what",
    "how",
    "can",
    "do",
    "please"
}
def get_keywords(query):
    words = query.lower().split()

    keywords = [
        word.strip(string.punctuation)
        for word in words
        if word not in STOP_WORDS
    ]

    normalized_keywords = []

    for keyword in keywords:
        if keyword == "pay":
            normalized_keywords.append("payment")
        else:
            normalized_keywords.append(keyword)

    return normalized_keywords

#Test
if __name__ == "__main__":

    test_queries = [
        "I want to cancel my order",
        "I need a refund",
        "What does shipped mean?",
        "How can I pay?"
    ]

    for query in test_queries:
     print("\n==============================")
     print("QUERY:", query)

     print("KEYWORDS:", get_keywords(query))

     results = search_knowledge(query)

     if results:
        print("\nTop document content:")
        print(results[0]["document"]["content"])

     for result in results:
        print(
            result["document"]["category"],
            "→",
            result["document"]["file"],
            "→ score:",
            result["score"]
        )