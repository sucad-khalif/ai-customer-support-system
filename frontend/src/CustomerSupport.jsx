
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomerChat from "./CustomerChat";

function CustomerSupport() {
  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // CUSTOMER & CHAT STATE
  // ==========================================

  const [customer, setCustomer] = useState(null);

  const [chatOpen, setChatOpen] = useState(
    location.state?.openChat === true
  );

  // ==========================================
  // LOAD CUSTOMER
  // ==========================================

  useEffect(() => {
    const savedCustomer = localStorage.getItem("customer");

    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
      } catch (error) {
        console.error("Invalid customer data:", error);
      }
    }
  }, []);

  // ==========================================
  // CHAT FUNCTIONS
  // ==========================================

  const openChat = () => {
    setChatOpen(true);
  };

  const closeChat = () => {
    setChatOpen(false);
  };

  // ==========================================
  // NAVIGATION
  // ==========================================

  const goHome = () => {
    navigate("/customer-dashboard");
  };

  const goOrders = () => {
    navigate("/my-orders");
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="customer-support-page">

      {/* ======================================
          NAVBAR
          ====================================== */}

      <nav className="support-navbar">

        {/* LOGO */}
        <div
          className="support-logo"
          onClick={goHome}
        >
          🍔 <span>Restaurant</span>
        </div>

        {/* NAVIGATION */}
        <div className="support-nav-links">

          <button onClick={goHome}>
            Home
          </button>

          <button onClick={goOrders}>
            My Orders
          </button>

          <button className="active">
            Support
          </button>

        </div>

        {/* ACCOUNT */}
        <button
          className="support-account"
          onClick={goHome}
        >
          👤 My Account
        </button>

      </nav>


      {/* ======================================
          HERO / CALL CENTER
          ====================================== */}

      <section className="support-hero">

        {/* LEFT SIDE */}
        <div className="support-hero-content">

          <span className="support-badge">
            🟢 CUSTOMER SUPPORT CENTER
          </span>

          <h1>
            We're Here to
            <span> Help You</span>
          </h1>

          <p>
            Have a question about your order?
            Need help with a cancellation or refund?
            Our support team is ready to help you.
          </p>

          <div className="support-buttons">

            <button
              className="start-chat-button"
              onClick={openChat}
            >
              🤖 Start AI Chat
            </button>

            <button className="call-button">
              📞 Call Support
            </button>

          </div>

        </div>


        {/* ==================================
            CALL CENTER VISUAL
            ================================== */}

        <div className="support-visual">

          <div className="support-circle circle-one"></div>

          <div className="support-circle circle-two"></div>


          {/* MAIN AGENT */}

          <div className="agent-main">

            <div className="agent-avatar">
              👩‍💼
            </div>

            <div className="agent-headset">
              🎧
            </div>

            <div className="agent-status">
              <span></span>
              Available
            </div>

          </div>


          {/* FLOATING CARD 1 */}

          <div className="floating-card card-one">

            <span>📞</span>

            <div>
              <strong>
                Live Support
              </strong>

              <small>
                Agents online
              </small>
            </div>

          </div>


          {/* FLOATING CARD 2 */}

          <div className="floating-card card-two">

            <span>💬</span>

            <div>
              <strong>
                Quick Response
              </strong>

              <small>
                We're here for you
              </small>
            </div>

          </div>


          {/* FLOATING CARD 3 */}

          <div className="floating-card card-three">

            <span>🤖</span>

            <div>
              <strong>
                AI Assistant
              </strong>

              <small>
                Available 24/7
              </small>
            </div>

          </div>

        </div>

      </section>


      {/* ======================================
          SUPPORT OPTIONS
          ====================================== */}

      <section className="support-options">

        <div className="support-section-title">

          <span>
            HOW CAN WE HELP?
          </span>

          <h2>
            Choose Your Support
          </h2>

          <p>
            Get help quickly through our
            different support options.
          </p>

        </div>


        <div className="support-cards">

          {/* AI SUPPORT */}

          <div className="support-card">

            <div className="support-card-icon">
              🤖
            </div>

            <h3>
              AI Customer Support
            </h3>

            <p>
              Ask questions about your order,
              cancellation, refunds, or other
              restaurant services.
            </p>

            <button onClick={openChat}>
              Start Chat →
            </button>

          </div>


          {/* CALL CENTER */}

          <div className="support-card">

            <div className="support-card-icon">
              📞
            </div>

            <h3>
              Call Center
            </h3>

            <p>
              Need direct assistance?
              Our customer support team
              is ready to help you.
            </p>

            <button
              className="secondary-support-button"
            >
              Call Support →
            </button>

          </div>


          {/* ORDER HELP */}

          <div className="support-card">

            <div className="support-card-icon">
              📋
            </div>

            <h3>
              Order Help
            </h3>

            <p>
              Check your order status,
              delivery progress, and
              previous orders.
            </p>

            <button onClick={goOrders}>
              View Orders →
            </button>

          </div>

        </div>

      </section>


      {/* ======================================
          SUPPORT TEAM
          ====================================== */}

      <section className="support-team">

        <div className="support-section-title">

          <span>
            OUR TEAM
          </span>

          <h2>
            We're Ready to Help
          </h2>

        </div>


        <div className="team-members">

          {/* SARAH */}

          <div className="team-member">

            <div className="team-avatar">
              👩‍💼
            </div>

            <h3>
              Sarah
            </h3>

            <p>
              Customer Support
            </p>

            <span className="online-status">
              ● Online
            </span>

          </div>


          {/* AHMED */}

          <div className="team-member">

            <div className="team-avatar">
              👨‍💼
            </div>

            <h3>
              Ahmed
            </h3>

            <p>
              Support Specialist
            </p>

            <span className="online-status">
              ● Online
            </span>

          </div>


          {/* MARY */}

          <div className="team-member">

            <div className="team-avatar">
              👩‍💻
            </div>

            <h3>
              Mary
            </h3>

            <p>
              Customer Care
            </p>

            <span className="online-status">
              ● Online
            </span>

          </div>


          {/* AI */}

          <div className="team-member">

            <div className="team-avatar">
              🤖
            </div>

            <h3>
              AI Assistant
            </h3>

            <p>
              Available 24/7
            </p>

            <span className="online-status">
              ● Online
            </span>

          </div>

        </div>

      </section>


      {/* ======================================
          FOOTER
          ====================================== */}

      <footer className="support-footer">

        {/* RESTAURANT */}

        <div>

          <strong>
            🍔 Restaurant
          </strong>

          <p>
            Delicious food. Great service.
            We're always here to help.
          </p>

        </div>


        {/* SUPPORT */}

        <div>

          <h4>
            Support
          </h4>

          <button onClick={openChat}>
            AI Chat
          </button>

          <button onClick={goOrders}>
            My Orders
          </button>

        </div>


        {/* CONTACT */}

        <div>

          <h4>
            Contact
          </h4>

          <p>
            📞 +252 61 XXX XXXX
          </p>

          <p>
            ✉️ support@restaurant.com
          </p>

        </div>

      </footer>


      {/* ======================================
          AI CHAT POPUP
          ====================================== */}

      {customer && (
        <CustomerChat
          customer={customer}
          startOpen={chatOpen}
          onClose={closeChat}
        />
      )}

    </div>
  );
}

export default CustomerSupport;