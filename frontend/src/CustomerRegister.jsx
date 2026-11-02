
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function CustomerRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");

    // Check password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/customers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Registration failed.");
        return;
      }

      // Registration successful
      navigate("/my-orders", {
        state: {
          customer: data,
        },
      });
    } catch (error) {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-register-page">

      {/* Register Card */}
      <div className="customer-register-container">

        {/* Header */}
        <div className="customer-register-header">

          <div className="customer-register-icon">
            🍔
          </div>

          <h1>Create Your Account</h1>

          <p>
            Register to place and manage your orders.
          </p>

        </div>

        {/* Register Form */}
        <form
          className="customer-register-form"
          onSubmit={handleRegister}
        >

          {/* Full Name */}
          <div className="customer-register-input-group">

            <label htmlFor="customer-name">
              Full Name
            </label>

            <input
              id="customer-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your full name"
              required
            />

          </div>

          {/* Email */}
          <div className="customer-register-input-group">

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
          <div className="customer-register-input-group">

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
              minLength={8}
              required
            />

            <small>
              Password must be at least 8 characters.
            </small>

          </div>

          {/* Confirm Password */}
          <div className="customer-register-input-group">

            <label htmlFor="customer-confirm-password">
              Confirm Password
            </label>

            <input
              id="customer-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirm your password"
              minLength={8}
              required
            />

          </div>

          {/* Error */}
          {error && (
            <p className="customer-register-error">
              {error}
            </p>
          )}

          {/* Register Button */}
          <button
            type="submit"
            className="customer-register-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        {/* Login Link */}
        <div className="customer-register-footer">

          <p>
            Already have an account?{" "}
            <Link to="/login">
              Login
            </Link>
          </p>

        </div>

        {/* Back Home */}
        <Link
          to="/"
          className="customer-register-home"
        >
          ← Back to Home
        </Link>

      </div>
    </div>
  );
}

export default CustomerRegister;
