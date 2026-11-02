import { useState } from "react";
import { useNavigate } from "react-router-dom";

function StaffLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/staff/login",
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
        setError(data.detail || "Login failed");
        return;
      }

      localStorage.setItem(
        "staff_token",
        data.access_token
      );

      localStorage.setItem(
        "staff_role",
        data.role
      );

      localStorage.setItem(
        "staff_name",
        data.name
      );

      navigate("/staff");

    } catch (error) {
      setError(
        "Cannot connect to the server."
      );
    }
  };

  return (
    <div className="staff-login-container">

      <div className="staff-login-card">

        <h1>Staff Login</h1>

        <p>
          Login to access the staff dashboard
        </p>

        {error && (
          <div className="staff-login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter staff email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

      </div>

    </div>
  );
}

export default StaffLogin;