import { useEffect, useState } from "react";

function Handoffs() {
  const [handoffs, setHandoffs] = useState([]);
  const [selectedHandoff, setSelectedHandoff] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/handoffs")
      .then((response) => response.json())
      .then((data) => {
        setHandoffs(data);
      });
  }, []);

  const handleResolve = (handoffId) => {
    fetch(`http://127.0.0.1:8000/handoffs/${handoffId}/resolve`, {
      method: "PUT",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        setHandoffs((currentHandoffs) =>
          currentHandoffs.map((handoff) =>
            handoff.handoff_id === handoffId
              ? { ...handoff, status: "resolved" }
              : handoff
          )
        );

        setSelectedHandoff((currentHandoff) =>
          currentHandoff &&
          currentHandoff.handoff_id === handoffId
            ? { ...currentHandoff, status: "resolved" }
            : currentHandoff
        );
      });
  };

  const handleView = (handoffId) => {
    fetch(`http://127.0.0.1:8000/handoffs/${handoffId}`)
      .then((response) => response.json())
      .then((data) => {
        setSelectedHandoff(data);
      });
  };

  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Handoffs</h1>
          <p>View customer requests for human support</p>
        </div>
      </div>

      <section className="recent-orders">
        <h2>Handoff List</h2>

        <table>
          <thead>
            <tr>
              <th>Handoff ID</th>
              <th>Customer</th>
              <th>Conversation ID</th>
              <th>Order ID</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {handoffs.map((handoff) => (
              <tr key={handoff.handoff_id}>
                <td>{handoff.handoff_id}</td>
                <td>{handoff.customer_name}</td>
                <td>{handoff.conversation_id}</td>
                <td>{handoff.order_id}</td>
                <td>{handoff.reason}</td>
                <td>{handoff.status}</td>

                <td className="handoff-actions">
                  <button
                    className="view-button"
                    onClick={() => handleView(handoff.handoff_id)}
                  >
                    View
                  </button>

                  <button
                    className="resolve-button"
                    onClick={() => handleResolve(handoff.handoff_id)}
                  >
                    Resolve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selectedHandoff && (
        <section className="handoff-details">
          <h2>Handoff Details</h2>

          <div className="handoff-detail-row">
            <strong>Handoff ID</strong>
            <span>{selectedHandoff.handoff_id}</span>
          </div>

          <div className="handoff-detail-row">
            <strong>Customer</strong>
            <span>{selectedHandoff.customer_name}</span>
          </div>

          <div className="handoff-detail-row">
            <strong>Conversation ID</strong>
            <span>{selectedHandoff.conversation_id}</span>
          </div>

          <div className="handoff-detail-row">
            <strong>Order ID</strong>
            <span>{selectedHandoff.order_id}</span>
          </div>

          <div className="handoff-detail-row">
            <strong>Reason</strong>
            <span>{selectedHandoff.reason}</span>
          </div>

          <div className="handoff-detail-row">
            <strong>Status</strong>
            <span>{selectedHandoff.status}</span>
          </div>

          {selectedHandoff.messages && (
            <div className="handoff-messages">
              <h3>Conversation</h3>

              {selectedHandoff.messages.map((message, index) => (
                <div className="message-item" key={index}>
                  <strong>{message.role}</strong>
                  <p>{message.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}

export default Handoffs;