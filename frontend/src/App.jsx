
import "./App.css";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Profile from "./Profile";
import Home from "./Home";
import StaffLogin from "./StaffLogin";

// =====================================================
// STAFF COMPONENTS
// =====================================================

import Layout from "./Layout";
import Customers from "./Customers";
import Orders from "./Orders";
import Conversations from "./Conversations";
import Handoffs from "./Handoffs";

// =====================================================
// CUSTOMER COMPONENTS
// =====================================================

import CustomerRegister from "./CustomerRegister";
import CustomerLogin from "./CustomerLogin";
import CustomerDashboard from "./CustomerDashboard";
import CustomerSupport from "./CustomerSupport";
import MyOrders from "./MyOrders";
import CustomerChat from "./CustomerChat";
import OrderDetails from "./OrderDetails";

// =====================================================
// STAFF DASHBOARD
// =====================================================

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    customers: 0,
    orders: 0,
    handoffs: 0,
  });

  const [orders, setOrders] = useState([]);
  const [handoffs, setHandoffs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===================================================
  // GET STAFF TOKEN
  // ===================================================

  const token = localStorage.getItem("staff_token");

  // ===================================================
  // CHECK LOGIN
  // ===================================================

  useEffect(() => {
    if (!token) {
      navigate("/staff-login");
    }
  }, [token, navigate]);

  // ===================================================
  // AUTHORIZATION HEADER
  // ===================================================

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  // ===================================================
  // LOAD DASHBOARD DATA
  // ===================================================

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        // -----------------------------------------------
        // Dashboard Stats
        // -----------------------------------------------

        const statsResponse = await fetch(
          "http://127.0.0.1:8000/dashboard/stats",
          {
            headers: authHeaders,
          }
        );

        if (statsResponse.status === 401) {
          localStorage.removeItem("staff_token");
          localStorage.removeItem("staff_role");
          localStorage.removeItem("staff_name");

          navigate("/staff-login");
          return;
        }

        if (!statsResponse.ok) {
          throw new Error("Failed to load dashboard statistics");
        }

        const statsData = await statsResponse.json();

        setStats({
          customers: statsData.customers || 0,
          orders: statsData.orders || 0,
          handoffs: statsData.handoffs || 0,
        });

        // -----------------------------------------------
        // Dashboard Orders
        // -----------------------------------------------

        const ordersResponse = await fetch(
          "http://127.0.0.1:8000/dashboard/orders",
          {
            headers: authHeaders,
          }
        );

        if (ordersResponse.status === 401) {
          localStorage.removeItem("staff_token");
          localStorage.removeItem("staff_role");
          localStorage.removeItem("staff_name");

          navigate("/staff-login");
          return;
        }

        if (!ordersResponse.ok) {
          throw new Error("Failed to load orders");
        }

        const ordersData = await ordersResponse.json();

        setOrders(Array.isArray(ordersData) ? ordersData : []);

        // -----------------------------------------------
        // Dashboard Handoffs
        // -----------------------------------------------

        const handoffsResponse = await fetch(
          "http://127.0.0.1:8000/dashboard/handoffs",
          {
            headers: authHeaders,
          }
        );

        if (handoffsResponse.status === 401) {
          localStorage.removeItem("staff_token");
          localStorage.removeItem("staff_role");
          localStorage.removeItem("staff_name");

          navigate("/staff-login");
          return;
        }

        if (!handoffsResponse.ok) {
          throw new Error("Failed to load handoffs");
        }

        const handoffsData = await handoffsResponse.json();

        setHandoffs(Array.isArray(handoffsData) ? handoffsData : []);

      } catch (error) {
        console.error("Dashboard loading error:", error);

        setError(
          "Unable to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [token, navigate]);

  // ===================================================
  // DASHBOARD LOADING
  // ===================================================

  if (!token) {
    return null;
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading Dashboard...</h2>
        <p>Please wait.</p>
      </div>
    );
  }

  // ===================================================
  // DASHBOARD ERROR
  // ===================================================

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Dashboard Error</h2>
        <p>{error}</p>

        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  // ===================================================
  // DASHBOARD UI
  // ===================================================

  const staffName =
    localStorage.getItem("staff_name") || "Staff";

  const staffRole =
    localStorage.getItem("staff_role") || "staff";

  return (
    <>
      {/* =================================================
          DASHBOARD HEADER
      ================================================= */}

      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>

          <p>
            Welcome back, {staffName}
          </p>

          <small>
            Role:{" "}
            {staffRole === "super_admin"
              ? "Super Admin"
              : "Staff"}
          </small>
        </div>
      </div>

      {/* =================================================
          DASHBOARD CARDS
      ================================================= */}

      <section className="dashboard-cards">

        <div className="card">
          <h3>Customers</h3>
          <p>{stats.customers}</p>
        </div>

        <div className="card">
          <h3>Orders</h3>
          <p>{stats.orders}</p>
        </div>

        <div className="card">
          <h3>Handoffs</h3>
          <p>{stats.handoffs}</p>
        </div>

      </section>

      {/* =================================================
          RECENT ORDERS
      ================================================= */}

      <section className="recent-orders">

        <h2>Recent Orders</h2>

        <table>

          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.order_id}>

                  <td>
                    {order.order_id}
                  </td>

                  <td>
                    {order.customer_name}
                  </td>

                  <td>
                    {order.product}
                  </td>

                  <td>
                    {order.status}
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">
                  No orders found.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </section>

      {/* =================================================
          RECENT HANDOFFS
      ================================================= */}

      <section className="recent-handoffs">

        <h2>Recent Handoffs</h2>

        <table>

          <thead>
            <tr>
              <th>Customer</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {handoffs.length > 0 ? (
              handoffs.map((handoff, index) => (
                <tr key={index}>

                  <td>
                    {handoff.customer_name}
                  </td>

                  <td>
                    {handoff.reason}
                  </td>

                  <td>
                    {handoff.status}
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">
                  No handoffs found.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </section>
    </>
  );
}

// =====================================================
// MAIN APP
// =====================================================

function App() {
  return (
    <Routes>

      {/* =================================================
          PUBLIC HOME
      ================================================= */}

      <Route
        path="/"
        element={<Home />}
      />

      {/* =================================================
          STAFF LOGIN
      ================================================= */}

      <Route
        path="/staff-login"
        element={<StaffLogin />}
      />

      {/* =================================================
          STAFF DASHBOARD
      ================================================= */}

      <Route
        path="/staff"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />

      {/* =================================================
          STAFF CUSTOMERS
      ================================================= */}

      <Route
        path="/customers"
        element={
          <Layout>
            <Customers />
          </Layout>
        }
      />

      {/* =================================================
          STAFF ORDERS
      ================================================= */}

      <Route
        path="/orders"
        element={
          <Layout>
            <Orders />
          </Layout>
        }
      />

      {/* =================================================
          STAFF CONVERSATIONS
      ================================================= */}

      <Route
        path="/conversations"
        element={
          <Layout>
            <Conversations />
          </Layout>
        }
      />

      {/* =================================================
          STAFF HANDOFFS
      ================================================= */}

      <Route
        path="/handoffs"
        element={
          <Layout>
            <Handoffs />
          </Layout>
        }
      />

      {/* =================================================
          CUSTOMER REGISTER
      ================================================= */}

      <Route
        path="/register"
        element={<CustomerRegister />}
      />

      {/* =================================================
          CUSTOMER LOGIN
      ================================================= */}

      <Route
        path="/login"
        element={<CustomerLogin />}
      />

      {/* =================================================
          CUSTOMER DASHBOARD
      ================================================= */}

      <Route
        path="/customer-dashboard"
        element={<CustomerDashboard />}
      />

      {/* =================================================
          CUSTOMER SUPPORT
      ================================================= */}

      <Route
        path="/customer-support"
        element={<CustomerSupport />}
      />

      {/* =================================================
          CUSTOMER ORDERS
      ================================================= */}

      <Route
        path="/my-orders"
        element={<MyOrders />}
      />

      {/* =================================================
          CUSTOMER CHAT
      ================================================= */}

      <Route
        path="/customer-chat"
        element={
          <Navigate
            to="/customer-support"
            replace
          />
        }
      />

      {/* =================================================
          CUSTOMER PROFILE
      ================================================= */}

      <Route
        path="/profile"
        element={<Profile />}
      />

      {/* =================================================
          CUSTOMER ORDER DETAILS
      ================================================= */}

      <Route
        path="/orders/:orderId"
        element={<OrderDetails />}
      />

    </Routes>
  );
}

export default App;
