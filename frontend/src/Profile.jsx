
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);

  // =========================
  // LOAD CUSTOMER
  // =========================
  useEffect(() => {
    const savedCustomer = localStorage.getItem("customer");

    if (!savedCustomer) {
      navigate("/login");
      return;
    }

    try {
      const customerData = JSON.parse(savedCustomer);
      setCustomer(customerData);
    } catch (error) {
      console.error("Invalid customer data:", error);

      localStorage.removeItem("customer");
      navigate("/login");
    }
  }, [navigate]);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("customer");
    navigate("/login");
  };

  // =========================
  // LOADING
  // =========================
  if (!customer) {
    return (
      <div className="customer-loading">
        <div className="customer-loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="profile-navbar">

        {/* LOGO */}

        <div
          className="profile-logo"
          onClick={() => navigate("/customer-dashboard")}
        >
          <div className="profile-logo-icon">
            🍕
          </div>

          <div>
            <h2>Pizza Kitchen</h2>
            <span>Fresh • Fast • Delicious</span>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="profile-nav">

          <button
            onClick={() =>
              navigate("/customer-dashboard")
            }
          >
            Home
          </button>

          <button
            onClick={() =>
              navigate("/my-orders")
            }
          >
            My Orders
          </button>

          <button
            onClick={() =>
              navigate("/customer-support")
            }
          >
            Support
          </button>

          <button className="profile-nav-active">
            Profile
          </button>

        </nav>

        {/* CUSTOMER */}

        <div className="profile-user">

          <div className="profile-user-avatar">
            {customer.name
              ? customer.name.charAt(0).toUpperCase()
              : "C"}
          </div>

          <div>
            <strong>{customer.name}</strong>
            <span>Customer</span>
          </div>

        </div>

      </header>

      {/* =================================================
          PROFILE HERO
      ================================================= */}

      <section className="profile-hero">

        <div className="profile-hero-content">

          <span className="profile-label">
            👤 MY ACCOUNT
          </span>

          <h1>
            Welcome,
            <br />
            <span>{customer.name}</span>
          </h1>

          <p>
            Manage your account information,
            view your orders and access customer
            support from one place.
          </p>

        </div>

        <div className="profile-hero-avatar">

          <div className="profile-large-avatar">
            {customer.name
              ? customer.name.charAt(0).toUpperCase()
              : "C"}
          </div>

          <span className="profile-online">
            ● Active Customer
          </span>

        </div>

      </section>

      {/* =================================================
          PROFILE CONTENT
      ================================================= */}

      <main className="profile-content">

        {/* PERSONAL INFORMATION */}

        <section className="profile-card">

          <div className="profile-card-header">

            <div>
              <span className="profile-card-label">
                ACCOUNT
              </span>

              <h2>Personal Information</h2>

              <p>
                Your registered customer information.
              </p>
            </div>

            <div className="profile-card-icon">
              👤
            </div>

          </div>

          <div className="profile-info-grid">

            <div className="profile-info-item">

              <span>Full Name</span>

              <strong>
                {customer.name || "Not provided"}
              </strong>

            </div>

            <div className="profile-info-item">

              <span>Email Address</span>

              <strong>
                {customer.email || "Not provided"}
              </strong>

            </div>

            <div className="profile-info-item">

              <span>Customer ID</span>

              <strong>
                #{customer.id || "N/A"}
              </strong>

            </div>

            <div className="profile-info-item">

              <span>Account Status</span>

              <strong className="profile-status">
                ● Active
              </strong>

            </div>

          </div>

        </section>

        {/* ACCOUNT OPTIONS */}

        <section className="profile-card">

          <div className="profile-card-header">

            <div>
              <span className="profile-card-label">
                ACCOUNT SETTINGS
              </span>

              <h2>Account Options</h2>

              <p>
                Manage your account and restaurant
                services.
              </p>
            </div>

            <div className="profile-card-icon">
              ⚙️
            </div>

          </div>

          <div className="profile-options">

            {/* MY ORDERS */}

            <button
              className="profile-option"
              onClick={() =>
                navigate("/my-orders")
              }
            >

              <div className="profile-option-icon">
                📦
              </div>

              <div className="profile-option-content">

                <strong>My Orders</strong>

                <span>
                  View and track your restaurant
                  orders.
                </span>

              </div>

              <span className="profile-option-arrow">
                →
              </span>

            </button>

            {/* SUPPORT */}

            <button
              className="profile-option"
              onClick={() =>
                navigate("/customer-support", {
                  state: {
                    openChat: true,
                  },
                })
              }
            >

              <div className="profile-option-icon">
                🤖
              </div>

              <div className="profile-option-content">

                <strong>AI Customer Support</strong>

                <span>
                  Get help with orders, refunds,
                  cancellations and more.
                </span>

              </div>

              <span className="profile-option-arrow">
                →
              </span>

            </button>

            {/* HOME */}

            <button
              className="profile-option"
              onClick={() =>
                navigate("/customer-dashboard")
              }
            >

              <div className="profile-option-icon">
                🏠
              </div>

              <div className="profile-option-content">

                <strong>Restaurant Home</strong>

                <span>
                  Return to the Pizza Kitchen
                  homepage.
                </span>

              </div>

              <span className="profile-option-arrow">
                →
              </span>

            </button>

          </div>

        </section>

        {/* SECURITY */}

        <section className="profile-card">

          <div className="profile-card-header">

            <div>
              <span className="profile-card-label">
                SECURITY
              </span>

              <h2>Account Security</h2>

              <p>
                Keep your customer account secure.
              </p>
            </div>

            <div className="profile-card-icon">
              🔐
            </div>

          </div>

          <div className="profile-security">

            <div className="security-item">

              <div className="security-icon">
                🔑
              </div>

              <div>
                <strong>Password</strong>

                <span>
                  Your password is securely protected.
                </span>
              </div>

            </div>

            <div className="security-item">

              <div className="security-icon">
                🛡️
              </div>

              <div>
                <strong>Account Protection</strong>

                <span>
                  Your account information is protected.
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* LOGOUT */}

        <section className="profile-logout-section">

          <div>

            <span>
              ACCOUNT ACTION
            </span>

            <h3>Sign out of your account</h3>

            <p>
              You can log in again anytime using
              your customer account.
            </p>

          </div>

          <button
            className="profile-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="profile-footer">

        <div>
          <strong>🍕 Pizza Kitchen</strong>

          <p>
            Fresh food. Happy customers.
          </p>
        </div>

        <div className="profile-footer-links">

          <button
            onClick={() =>
              navigate("/customer-dashboard")
            }
          >
            Home
          </button>

          <button
            onClick={() =>
              navigate("/my-orders")
            }
          >
            My Orders
          </button>

          <button
            onClick={() =>
              navigate("/customer-support")
            }
          >
            Support
          </button>

        </div>

        <div>
          <span>Logged in as</span>
          <strong>{customer.email}</strong>
        </div>

      </footer>

    </div>
  );
}

export default Profile;
