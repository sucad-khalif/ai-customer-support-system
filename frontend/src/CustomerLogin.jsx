
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail || "Invalid email or password."
        );
        return;
      }

      // Save logged-in customer
      localStorage.setItem(
        "customer",
        JSON.stringify(data.customer)
      );

      // Go to customer dashboard
      navigate("/customer-dashboard");
    } catch (error) {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-login-page">

      {/* Login Card */}
      <div className="customer-login-container">

        {/* Header */}
        <div className="customer-login-header">

          <div className="customer-login-icon">
            🍔
          </div>

          <h1>Customer Login</h1>

          <p>
            Login to manage your orders and get
            customer support.
          </p>

        </div>

        {/* Login Form */}
        <form
          className="customer-login-form"
          onSubmit={handleLogin}
        >

          {/* Email */}
          <div className="customer-login-input-group">

            <label htmlFor="customer-email">
              Email Address
            </label>

            <input
              id="customer-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              required
            />

          </div>

          {/* Password */}
          <div className="customer-login-input-group">

            <label htmlFor="customer-password">
              Password
            </label>

            <input
              id="customer-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
            />

          </div>

          {/* Error */}
          {error && (
            <p className="customer-login-error">
              {error}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="customer-login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* Register */}
        <div className="customer-login-footer">

          <p>
            Don't have an account?{" "}
            <Link to="/register">
              Create an account
            </Link>
          </p>

        </div>

        {/* Back Home */}
        <Link
          to="/"
          className="customer-login-home"
        >
          ← Back to Home
        </Link>

      </div>
    </div>
  );
}

export default CustomerLogin;
