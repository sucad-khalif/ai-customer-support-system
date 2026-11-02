import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./App.css";

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const customer = localStorage.getItem("customer");

    if (!customer) {
      navigate("/login");
      return;
    }

    fetch(`http://127.0.0.1:8000/orders/${orderId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Order not found");
        }

        return response.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load order details.");
        setLoading(false);
      });
  }, [orderId, navigate]);

  const getStatusStep = () => {
    if (!order) return 0;

    const steps = {
      pending: 1,
      preparing: 2,
      shipped: 3,
      delivered: 4,
      cancelled: 0,
    };

    return steps[order.status] || 1;
  };

  const currentStep = getStatusStep();

  if (loading) {
    return (
      <div className="order-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-error">
        <div className="error-icon">⚠️</div>
        <h2>Order Not Found</h2>
        <p>{error || "We couldn't find this order."}</p>

        <button
          className="order-back-btn"
          onClick={() => navigate("/my-orders")}
        >
          ← Back to My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="order-details-page">

      {/* NAVBAR */}
      <nav className="customer-navbar">
        <div
          className="customer-logo"
          onClick={() => navigate("/customer-dashboard")}
        >
          🍕 PIZZA KITCHEN
        </div>

        <div className="customer-nav-links">
          <button onClick={() => navigate("/customer-dashboard")}>
            HOME
          </button>

          <button onClick={() => navigate("/customer-dashboard#menu")}>
            MENU
          </button>

          <button onClick={() => navigate("/my-orders")}>
            MY ORDERS
          </button>

          <button onClick={() => navigate("/customer-chat")}>
            SUPPORT
          </button>

          <button onClick={() => navigate("/profile")}>
            PROFILE
          </button>
        </div>
      </nav>

      {/* HEADER */}
      <section className="order-details-header">
        <button
          className="back-link"
          onClick={() => navigate("/my-orders")}
        >
          ← Back to My Orders
        </button>

        <h1>Order Details</h1>

        <p>
          Track your order and see its current status.
        </p>
      </section>

      {/* ORDER CARD */}
      <section className="order-details-container">

        <div className="order-info-card">

          <div className="order-info-top">
            <div>
              <span className="order-label">ORDER</span>

              <h2>{order.order_id}</h2>
            </div>

            <span
              className={`order-status status-${order.status}`}
            >
              {order.status}
            </span>
          </div>

          <div className="order-info-divider"></div>

          <div className="order-information">

            <div className="order-info-item">
              <span>🍽️</span>

              <div>
                <small>PRODUCT</small>
                <strong>{order.product}</strong>
              </div>
            </div>

            <div className="order-info-item">
              <span>👤</span>

              <div>
                <small>CUSTOMER</small>
                <strong>{order.customer_name}</strong>
              </div>
            </div>

            <div className="order-info-item">
              <span>📧</span>

              <div>
                <small>EMAIL</small>
                <strong>{order.customer_email}</strong>
              </div>
            </div>

          </div>

        </div>

        {/* ORDER TRACKING */}
        <div className="order-tracking-card">

          <h2>Order Progress</h2>

          <p className="tracking-subtitle">
            Follow your order from preparation to delivery.
          </p>

          <div className="tracking">

            {/* STEP 1 */}
            <div
              className={`tracking-step ${
                currentStep >= 1 ? "completed" : ""
              }`}
            >
              <div className="tracking-circle">
                {currentStep >= 1 ? "✓" : "1"}
              </div>

              <div>
                <strong>Order Placed</strong>
                <span>Your order has been received.</span>
              </div>
            </div>

            {/* STEP 2 */}
            <div
              className={`tracking-step ${
                currentStep >= 2 ? "completed" : ""
              }`}
            >
              <div className="tracking-circle">
                {currentStep >= 2 ? "✓" : "2"}
              </div>

              <div>
                <strong>Preparing</strong>
                <span>Your food is being prepared.</span>
              </div>
            </div>

            {/* STEP 3 */}
            <div
              className={`tracking-step ${
                currentStep >= 3 ? "completed" : ""
              }`}
            >
              <div className="tracking-circle">
                {currentStep >= 3 ? "✓" : "3"}
              </div>

              <div>
                <strong>Shipped</strong>
                <span>Your order is on its way.</span>
              </div>
            </div>

            {/* STEP 4 */}
            <div
              className={`tracking-step ${
                currentStep >= 4 ? "completed" : ""
              }`}
            >
              <div className="tracking-circle">
                {currentStep >= 4 ? "✓" : "4"}
              </div>

              <div>
                <strong>Delivered</strong>
                <span>Your order has been delivered.</span>
              </div>
            </div>

          </div>

        </div>

        {/* SUPPORT */}
        <div className="order-support-card">

          <div>
            <span className="support-icon">🤖</span>

            <div>
              <h2>Need Help?</h2>

              <p>
                Have a question about your order?
                Our AI Support Assistant is ready to help.
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              navigate("/customer-chat", {
                state: {
                  orderId: order.order_id,
                },
              })
            }
          >
            💬 Chat with AI Support
          </button>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="customer-footer">
        <div>
          <h3>🍕 PIZZA KITCHEN</h3>
          <p>Fresh food made just for you.</p>
        </div>

        <div>
          <p>© 2026 Pizza Kitchen. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

export default OrderDetails;