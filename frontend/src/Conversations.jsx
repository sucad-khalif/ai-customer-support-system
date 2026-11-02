import { useEffect, useState } from "react";

function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/conversations")
      .then((response) => response.json())
      .then((data) => {
        setConversations(data);
      });
  }, []);

  const handleView = (conversationId) => {
    fetch(`http://127.0.0.1:8000/conversations/${conversationId}`)
      .then((response) => response.json())
      .then((data) => {
        setSelectedConversation(data);
      });
  };

  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Conversations</h1>
          <p>View customer conversations</p>
        </div>
      </div>

      <section className="recent-orders">
        <h2>Conversation List</h2>

        <table>
          <thead>
            <tr>
              <th>Conversation ID</th>
              <th>Customer</th>
              <th>Order ID</th>
              <th>Intent</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {conversations.map((conversation) => (
              <tr key={conversation.conversation_id}>
                <td>{conversation.conversation_id}</td>
                <td>{conversation.customer_name}</td>
                <td>{conversation.current_order_id}</td>
                <td>{conversation.current_intent}</td>
                <td>{conversation.state}</td>

                <td>
                  <button
                    className="view-button"
                    onClick={() =>
                      handleView(conversation.conversation_id)
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selectedConversation && (
        <section className="recent-orders">
          <h2>Conversation Details</h2>

          <table>
            <tbody>
              <tr>
                <th>Conversation ID</th>
                <td>{selectedConversation.conversation_id}</td>
              </tr>

              <tr>
                <th>Customer</th>
                <td>{selectedConversation.customer_name}</td>
              </tr>

              <tr>
                <th>Email</th>
                <td>{selectedConversation.customer_email}</td>
              </tr>

              <tr>
                <th>Order ID</th>
                <td>{selectedConversation.current_order_id}</td>
              </tr>

              <tr>
                <th>Intent</th>
                <td>{selectedConversation.current_intent}</td>
              </tr>

              <tr>
                <th>State</th>
                <td>{selectedConversation.state}</td>
              </tr>
            </tbody>
          </table>

          <h3>Messages</h3>

          <div className="handoff-messages">
            {selectedConversation.messages.map((message, index) => (
              <div className="message-item" key={index}>
                <strong>{message.role}</strong>
                <p>{message.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default Conversations;