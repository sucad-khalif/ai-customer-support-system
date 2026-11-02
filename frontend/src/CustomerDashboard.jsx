
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CustomerDashboard() {
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
  // GO TO MENU / ORDERS
  // =========================
  const handleOrder = () => {
    navigate("/my-orders");
  };

  // =========================
  // OPEN CUSTOMER SUPPORT
  // =========================
  const openChat = () => {
    navigate("/customer-support", {
      state: { openChat: true },
    });
  };

  // =========================
  // SCROLL TO SECTION
  // =========================
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // =========================
  // LOADING
  // =========================
  if (!customer) {
    return (
      <div className="customer-loading">
        <div className="customer-loading-spinner"></div>
        <p>Preparing your experience...</p>
      </div>
    );
  }

  // =========================
  // MENU ITEMS
  // =========================
  const menuItems = [
    {
      id: 1,
      name: "Margherita Pizza",
      description: "Fresh tomato, mozzarella and basil",
      price: "$8.00",
      category: "Pizza",
      image:
        "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: 2,
      name: "Classic Burger",
      description:
        "Juicy beef, cheese, lettuce and special sauce",
      price: "$7.00",
      category: "Burger",
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: 3,
      name: "Fried Chicken",
      description:
        "Crispy golden chicken with special seasoning",
      price: "$8.00",
      category: "Chicken",
      image:
        "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: 4,
      name: "French Fries",
      description:
        "Golden crispy fries with our special seasoning",
      price: "$3.00",
      category: "Sides",
      image:
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: 5,
      name: "Chicken Pizza",
      description:
        "Chicken, mozzarella, tomato and special sauce",
      price: "$9.50",
      category: "Pizza",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: 6,
      name: "Fresh Juice",
      description:
        "Freshly prepared natural fruit juice",
      price: "$2.50",
      category: "Drinks",
      image:
        "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=85",
    },
  ];

  return (
    <div className="restaurant-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="restaurant-navbar">

        {/* LOGO */}
        <div
          className="restaurant-logo"
          onClick={() => scrollToSection("home")}
        >
          <div className="restaurant-logo-icon">
            🍕
          </div>

          <div className="restaurant-logo-text">
            <h2>Pizza Kitchen</h2>
            <span>Fresh • Fast • Delicious</span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="restaurant-nav">

          <button
            className="nav-active"
            onClick={() => scrollToSection("home")}
          >
            Home
          </button>

          <button
            onClick={() => scrollToSection("menu")}
          >
            Menu
          </button>

          <button
            onClick={() => navigate("/my-orders")}
          >
            My Orders
          </button>

          {/* SUPPORT */}
          <button onClick={openChat}>
            Support
          </button>

          <button
            onClick={() => navigate("/profile")}
          >
            Profile
          </button>

        </nav>

        {/* CUSTOMER INFO */}
        <div className="restaurant-user">

          <div className="restaurant-avatar">
            {customer.name
              ? customer.name.charAt(0).toUpperCase()
              : "C"}
          </div>

          <div className="restaurant-user-info">
            <strong>{customer.name}</strong>
            <span>Customer</span>
          </div>

          <button
            className="restaurant-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="restaurant-hero"
        id="home"
      >

        <div className="hero-overlay"></div>

        <div className="hero-content">

          <span className="hero-small-title">
            ✦ FRESH & DELICIOUS
          </span>

          <h1>
            Great Food.
            <br />
            <span>Made For You.</span>
          </h1>

          <p>
            Welcome back,{" "}
            <strong>{customer.name}</strong>!
            <br />
            Enjoy delicious meals prepared
            with fresh ingredients and served
            with love.
          </p>

          <div className="hero-buttons">

            <button
              className="hero-order-button"
              onClick={handleOrder}
            >
              Order Now
              <span>→</span>
            </button>

            <button
              className="hero-menu-button"
              onClick={() => scrollToSection("menu")}
            >
              View Menu
            </button>

          </div>

          <div className="hero-features">

            <div className="hero-feature">
              <strong>30 min</strong>
              <span>Fast Delivery</span>
            </div>

            <div className="hero-feature-divider"></div>

            <div className="hero-feature">
              <strong>4.9 ⭐</strong>
              <span>Customer Rating</span>
            </div>

            <div className="hero-feature-divider"></div>

            <div className="hero-feature">
              <strong>100%</strong>
              <span>Fresh Food</span>
            </div>

          </div>

        </div>

        {/* HERO IMAGE */}
        <div className="hero-image-card">

          <img
            src="https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1200&q=90"
            alt="Delicious pizza"
          />

          <div className="hero-rating-card">

            <span>⭐</span>

            <div>
              <strong>4.9/5</strong>
              <small>Customer rating</small>
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          OUR STORY
      ===================================================== */}

      <section className="story-section">

        <div className="story-image">

          <img
            src="https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1000&q=85"
            alt="Fresh restaurant food"
          />

          <div className="story-badge">
            <strong>10+</strong>

            <span>
              Years of
              <br />
              great taste
            </span>
          </div>

        </div>

        <div className="story-content">

          <span className="section-label">
            OUR STORY
          </span>

          <h2>
            Fresh ingredients.
            <br />
            <span>Great food.</span>
          </h2>

          <p>
            At Pizza Kitchen, we believe that
            good food brings people together.
            Every meal is prepared with fresh
            ingredients, passion and attention
            to detail.
          </p>

          <p>
            From our kitchen to your table,
            we make sure every bite is
            delicious, fresh and memorable.
          </p>

          <div className="story-points">

            <div>
              <span>✓</span>
              <p>Fresh ingredients</p>
            </div>

            <div>
              <span>✓</span>
              <p>Prepared with care</p>
            </div>

            <div>
              <span>✓</span>
              <p>Fast service</p>
            </div>

          </div>

          <button
            className="story-button"
            onClick={() => scrollToSection("menu")}
          >
            Discover Our Menu →
          </button>

        </div>

      </section>

      {/* =====================================================
          MENU
      ===================================================== */}

      <section
        className="menu-section-new"
        id="menu"
      >

        <div className="section-heading-center">

          <span className="section-label">
            DISCOVER OUR MENU
          </span>

          <h2>
            Something delicious
            <br />
            <span>for everyone.</span>
          </h2>

          <p>
            Explore our selection of fresh
            and delicious meals prepared
            just for you.
          </p>

        </div>

        <div className="restaurant-menu-grid">

          {menuItems.map((item) => (

            <article
              className="restaurant-food-card"
              key={item.id}
            >

              <div className="restaurant-food-image">

                <img
                  src={item.image}
                  alt={item.name}
                />

                <span className="food-category-tag">
                  {item.category}
                </span>

              </div>

              <div className="restaurant-food-content">

                <div className="food-title-line">

                  <h3>{item.name}</h3>

                  <span>⭐ 4.8</span>

                </div>

                <p>{item.description}</p>

                <div className="food-bottom">

                  <strong>{item.price}</strong>

                  <button
                    type="button"
                    onClick={handleOrder}
                  >
                    Order
                    <span>+</span>
                  </button>

                </div>

              </div>

            </article>

          ))}

        </div>

        <div className="menu-view-all">

          <button
            type="button"
            onClick={handleOrder}
          >
            View Full Menu →
          </button>

        </div>

      </section>

      {/* =====================================================
          MY ORDERS PROMO
      ===================================================== */}

      <section className="orders-promo-section">

        <div className="orders-promo-icon">
          📦
        </div>

        <div className="orders-promo-content">

          <span className="section-label">
            YOUR ORDERS
          </span>

          <h2>Hungry for more?</h2>

          <p>
            View your previous orders and
            track your current orders anytime.
          </p>

        </div>

        <button
          className="orders-promo-button"
          onClick={() => navigate("/my-orders")}
        >
          View My Orders →
        </button>

      </section>

      {/* =====================================================
          AI SUPPORT
      ===================================================== */}

      <section className="support-section">

        <div className="support-content">

          <span className="support-label">
            🤖 AI CUSTOMER SUPPORT
          </span>

          <h2>
            Need help with
            <br />
            your order?
          </h2>

          <p>
            Our AI Customer Support is ready
            to help you check your order,
            request a cancellation, ask about
            refunds or connect you with a
            human support agent.
          </p>

          <button
            type="button"
            onClick={openChat}
            className="support-button"
          >
            Start Chat
            <span>→</span>
          </button>

        </div>

        <div className="support-visual">

          <div className="support-chat-card">

            <div className="support-chat-header">

              <div className="support-bot">
                🤖
              </div>

              <div>
                <strong>AI Support</strong>

                <span>● Online</span>
              </div>

            </div>

            <div className="support-message customer-message">
              Where is my order?
            </div>

            <div className="support-message bot-message">
              I'm checking your order now. 👋
            </div>

            <div className="support-message bot-message">
              Your order is being prepared.
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="restaurant-footer">

        <div className="footer-main">

          {/* BRAND */}
          <div className="footer-brand">

            <div className="restaurant-logo-icon">
              🍕
            </div>

            <div>
              <h3>Pizza Kitchen</h3>

              <p>
                Fresh food. Happy customers.
              </p>
            </div>

          </div>

          {/* FOOTER LINKS */}
          <div className="footer-links">

            <button
              type="button"
              onClick={() => scrollToSection("home")}
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("menu")}
            >
              Menu
            </button>

            <button
              type="button"
              onClick={() => navigate("/my-orders")}
            >
              My Orders
            </button>

            <button
              type="button"
              onClick={openChat}
            >
              Support
            </button>

          </div>

          {/* CUSTOMER */}
          <div className="footer-customer">

            <span>Logged in as</span>

            <strong>{customer.email}</strong>

          </div>

        </div>

        <div className="footer-bottom">

          <span>
            © 2026 Pizza Kitchen.
            All rights reserved.
          </span>

          <span>
            Made with ❤️ for our customers
          </span>

        </div>

      </footer>

    </div>
  );
}

export default CustomerDashboard;
