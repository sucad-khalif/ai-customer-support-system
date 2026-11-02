
import { Link, useNavigate, useLocation } from "react-router-dom";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const staffName = localStorage.getItem("staff_name") || "Staff";
  const staffRole = localStorage.getItem("staff_role") || "staff";

  const isSuperAdmin = staffRole === "super_admin";

  const handleLogout = () => {
    localStorage.removeItem("staff_token");
    localStorage.removeItem("staff_role");
    localStorage.removeItem("staff_name");

    navigate("/staff-login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="sidebar-header">
          <div className="logo-icon">AI</div>

          <div>
            <h2>AI Support</h2>
            <span>Management System</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          {isSuperAdmin && (
            <Link
              to="/staff"
              className={isActive("/staff") ? "nav-link active" : "nav-link"}
            >
              <span>📊</span>
              Dashboard
            </Link>
          )}

          <Link
            to="/customers"
            className={
              isActive("/customers")
                ? "nav-link active"
                : "nav-link"
            }
          >
            <span>👥</span>
            Customers
          </Link>

          <Link
            to="/orders"
            className={
              isActive("/orders")
                ? "nav-link active"
                : "nav-link"
            }
          >
            <span>📦</span>
            Orders
          </Link>

          {isSuperAdmin && (
            <>
              <Link
                to="/conversations"
                className={
                  isActive("/conversations")
                    ? "nav-link active"
                    : "nav-link"
                }
              >
                <span>💬</span>
                Conversations
              </Link>

              <Link
                to="/handoffs"
                className={
                  isActive("/handoffs")
                    ? "nav-link active"
                    : "nav-link"
                }
              >
                <span>🤝</span>
                Handoffs
              </Link>
            </>
          )}

        </nav>

        {/* PROFILE */}
        <div className="sidebar-profile">

          <div className="profile-avatar">
            {staffName.charAt(0).toUpperCase()}
          </div>

          <div className="profile-info">
            <strong>{staffName}</strong>

            <span>
              {isSuperAdmin ? "Super Admin" : "Staff"}
            </span>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            ↪
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        <div className="top-bar">

          <div>
            <h3>
              {isSuperAdmin ? "Admin Panel" : "Staff Panel"}
            </h3>

            <span className="page-subtitle">
              AI Customer Support System
            </span>
          </div>

          <div className="top-profile">

            <div className="top-avatar">
              {staffName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{staffName}</strong>

              <span>
                {isSuperAdmin ? "Super Admin" : "Staff"}
              </span>
            </div>

          </div>

        </div>

        <div className="page-content">
          {children}
        </div>

      </main>

    </div>
  );
}

export default Layout;
