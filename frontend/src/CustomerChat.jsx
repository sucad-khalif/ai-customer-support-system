import { useEffect, useState } from "react";
import "./App.css";

function CustomerChat({
  customer,
  orderId = null,
  startOpen = false,
}) {
  const [isOpen, setIsOpen] = useState(startOpen);

  useEffect(() => {
    setIsOpen(startOpen);
  }, [startOpen]);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! 👋 Welcome to our restaurant. How can I help you today?",
    },
  ]);

  const handleSend = async (event) => {
    event.preventDefault();

    const text = message.trim();

    if (!text || isLoading) return;

    // Customer-ka fariintiisa ku muuji chat-ka.
    setMessages((current) => [
      ...current,
      { role: "user", content: text },
    ]);

    setMessage("");
    setIsLoading(true);

    try {
      // Hubi in customer-ku diiwaangashan yahay.
      if (!customer?.id) {
        throw new Error("Please register before using customer support.");
      }

      // Fariinta u dir FastAPI backend-ka.
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: customer.id,
          order_id: orderId,
          message: text,
          conversation_id: `CONV-${customer.id}`,
        }),
      });

      

      const data = await response.json();

      if (!response.ok) {
        console.error("Chat API error:", data);
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "The chat request failed."
        );
      }

      // Backend-kaagu wuxuu jawaabta ku soo celiyaa agent_result.
      const reply =
        data.agent_result?.response ??
        data.agent_result?.message ??
        data.response ??
        data.reply ??
        data.message ??
        "I received your message, but no reply was provided.";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: String(reply),
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error.message.includes("register")
            ? "Please register first before contacting support."
            : "Sorry, I couldn't process your message. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      {isOpen && (
        <section className="customer-chat">
          <header className="customer-chat-header">
            <div className="chat-avatar">🤖</div>

            <div className="chat-heading">
              <h2>Restaurant Support</h2>
              <p>AI Customer Support</p>
            </div>

            <button
              type="button"
              className="chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div className="customer-chat-messages" aria-live="polite">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`chat-message ${item.role}`}
              >
                {item.content}
              </div>
            ))}

            {isLoading && (
              <div className="chat-message assistant">
                AI is typing...
              </div>
            )}
          </div>

          <form className="customer-chat-form" onSubmit={handleSend}>
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type your message..."
              aria-label="Your message"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="chat-launcher"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={
          isOpen ? "Close customer support" : "Open customer support"
        }
      >
        {isOpen ? "×" : "💬"}
      </button>
    </div>
  );
}

export default CustomerChat;