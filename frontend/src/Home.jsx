
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">

      {/* ================================
          NAVBAR
      ================================= */}

      <nav className="home-navbar">

        <div
          className="home-logo"
          onClick={() => navigate("/")}
        >
          <span className="home-logo-icon">🍔</span>
          <span>Restaurant</span>
        </div>

        <div className="home-nav-links">
          <button
            className="home-nav-active"
            onClick={() => navigate("/")}
          >
            Home
          </button>

          <button onClick={() => navigate("/my-orders")}>
            Menu
          </button>

          <button onClick={() => navigate("/customer-support")}>
            Support
          </button>
        </div>

        <div className="home-nav-actions">
          <button
            className="home-login-button"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="home-register-button"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>

      </nav>


      {/* ================================
          HERO SECTION
      ================================= */}

      <section className="home-hero">

        <div className="home-hero-content">

          <span className="home-badge">
            🍽️ FRESH • DELICIOUS • FAST
          </span>

          <h1>
            Delicious Food.
            <br />
            <span>Great Service.</span>
          </h1>

          <p>
            Enjoy delicious meals prepared with care.
            Order your favorite food and get fast,
            friendly customer support whenever you need it.
          </p>

          <div className="home-hero-buttons">

            <button
              className="home-primary-button"
              onClick={() => navigate("/register")}
            >
              Order Now →
            </button>

            <button
              className="home-secondary-button"
              onClick={() => navigate("/customer-support")}
            >
              🤖 AI Support
            </button>

          </div>

          <div className="home-trust">

            <div>
              <strong>⭐ 4.9</strong>
              <span>Customer Rating</span>
            </div>

            <div>
              <strong>🍔 20+</strong>
              <span>Food Choices</span>
            </div>

            <div>
              <strong>⚡ Fast</strong>
              <span>Service</span>
            </div>

          </div>

        </div>


        {/* HERO FOOD VISUAL */}

        <div className="home-hero-visual">

          <div className="home-food-circle">
            🍔
          </div>

          <div className="home-floating-card home-food-card-one">
            🍟
            <div>
              <strong>Fresh Fries</strong>
              <small>Ready to enjoy</small>
            </div>
          </div>

          <div className="home-floating-card home-food-card-two">
            🥤
            <div>
              <strong>Fresh Juice</strong>
              <small>Made with care</small>
            </div>
          </div>

          <div className="home-floating-card home-food-card-three">
            🍕
            <div>
              <strong>Hot Pizza</strong>
              <small>Delicious & fresh</small>
            </div>
          </div>

        </div>

      </section>


      {/* ================================
          POPULAR MENU
      ================================= */}

      <section className="home-menu-section">

        <div className="home-section-title">

          <span>OUR MENU</span>

          <h2>
            Popular Choices
          </h2>

          <p>
            Discover some of our customers' favorite meals.
          </p>

        </div>


        <div className="home-menu-grid">

          <div className="home-menu-card">

            <div className="home-menu-icon">
              🍔
            </div>

            <h3>Hamburger</h3>

            <p>
              Delicious burger prepared fresh for you.
            </p>

            <strong>$5.00</strong>

          </div>


          <div className="home-menu-card">

            <div className="home-menu-icon">
              🍗
            </div>

            <h3>Chicken Burger</h3>

            <p>
              Crispy chicken with fresh ingredients.
            </p>

            <strong>$6.50</strong>

          </div>


          <div className="home-menu-card">

            <div className="home-menu-icon">
              🍕
            </div>

            <h3>Pizza</h3>

            <p>
              Hot and delicious pizza made fresh.
            </p>

            <strong>$8.00</strong>

          </div>


          <div className="home-menu-card">

            <div className="home-menu-icon">
              🍟
            </div>

            <h3>French Fries</h3>

            <p>
              Crispy golden fries for every meal.
            </p>

            <strong>$2.50</strong>

          </div>

        </div>


        <button
          className="home-view-menu-button"
          onClick={() => navigate("/my-orders")}
        >
          View Full Menu →
        </button>

      </section>


      {/* ================================
          AI SUPPORT SECTION
      ================================= */}

      <section className="home-support-section">

        <div className="home-support-visual">

          <div className="home-support-circle">
            🤖
          </div>

          <div className="home-support-small-card">
            💬
            <span>Available 24/7</span>
          </div>

        </div>


        <div className="home-support-content">

          <span>SMART CUSTOMER SUPPORT</span>

          <h2>
            Need Help?
            <br />
            <strong>Our AI Assistant Is Here.</strong>
          </h2>

          <p>
            Ask about your order, cancellation, refunds,
            or anything else. Our AI customer support
            can help you quickly and connect you with
            a human when needed.
          </p>

          <button
            className="home-support-button"
            onClick={() => navigate("/customer-support")}
          >
            Chat With AI →
          </button>

        </div>

      </section>


      {/* ================================
          ABOUT SECTION
      ================================= */}

      <section className="home-about-section">

        <div className="home-about-content">

          <span>ABOUT US</span>

          <h2>
            Food Made With
            <br />
            <strong>Care & Quality</strong>
          </h2>

          <p>
            We believe great food should come with great
            service. Our restaurant combines delicious
            meals with modern customer support to give
            every customer a better experience.
          </p>

          <div className="home-about-points">

            <div>
              <span>✓</span>
              <p>Fresh ingredients</p>
            </div>

            <div>
              <span>✓</span>
              <p>Fast service</p>
            </div>

            <div>
              <span>✓</span>
              <p>AI customer support</p>
            </div>

          </div>

        </div>


        <div className="home-about-visual">

          <div className="home-about-food">
            🍽️
          </div>

        </div>

      </section>


      {/* ================================
          CALL TO ACTION
      ================================= */}

      <section className="home-cta">

        <div>

          <span>READY TO ORDER?</span>

          <h2>
            Your Next Favorite Meal
            <br />
            Is Waiting For You.
          </h2>

          <p>
            Create your account and start ordering today.
          </p>

          <button
            onClick={() => navigate("/register")}
          >
            Get Started →
          </button>

        </div>

      </section>


      {/* ================================
          FOOTER
      ================================= */}

      <footer className="home-footer">

        <div className="home-footer-brand">

          <h3>
            🍔 Restaurant
          </h3>

          <p>
            Delicious food. Great service.
            We're always here to help.
          </p>

        </div>


        <div className="home-footer-column">

          <h4>Quick Links</h4>

          <button onClick={() => navigate("/")}>
            Home
          </button>

          <button onClick={() => navigate("/my-orders")}>
            Menu
          </button>

          <button onClick={() => navigate("/customer-support")}>
            Support
          </button>

        </div>


        <div className="home-footer-column">

          <h4>Account</h4>

          <button onClick={() => navigate("/login")}>
            Login
          </button>

          <button onClick={() => navigate("/register")}>
            Register
          </button>

        </div>


        <div className="home-footer-column">

          <h4>Contact</h4>

          <p>📞 +252 61 XXX XXXX</p>
          <p>✉️ support@restaurant.com</p>

        </div>

      </footer>


      <div className="home-copyright">

        © 2026 Restaurant. All rights reserved.

      </div>

    </div>
  );
}

export default Home;
