
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // =====================================================
  // GET STAFF TOKEN
  // =====================================================

  const token = localStorage.getItem("staff_token");

  // =====================================================
  // LOAD ORDERS
  // =====================================================

  useEffect(() => {
    if (!token) {
      navigate("/staff-login");
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://127.0.0.1:8000/dashboard/orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Token expired / invalid
        if (response.status === 401) {
          localStorage.removeItem("staff_token");
          localStorage.removeItem("staff_role");
          localStorage.removeItem("staff_name");

          navigate("/staff-login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load orders");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }

      } catch (error) {
        console.error("Failed to load orders:", error);
        setError("Unable to load orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token, navigate]);

  // =====================================================
  // VIEW ORDER DETAILS
  // =====================================================

  const handleView = async (orderId) => {
    try {
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("staff_token");
        localStorage.removeItem("staff_role");
        localStorage.removeItem("staff_name");

        navigate("/staff-login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load order details");
      }

      const data = await response.json();

      setSelectedOrder(data);

    } catch (error) {
      console.error(
        "Failed to load order details:",
        error
      );

      setError("Unable to load order details.");
    }
  };

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  const handleStatusUpdate = async (orderId, status) => {
    try {
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/orders/${orderId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: status,
          }),
        }
      );

      // Token expired / invalid
      if (response.status === 401) {
        localStorage.removeItem("staff_token");
        localStorage.removeItem("staff_role");
        localStorage.removeItem("staff_name");

        navigate("/staff-login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();

        alert(
          errorData.detail ||
          "Failed to update order status"
        );

        return;
      }

      const updatedOrder = await response.json();

      // Update order list
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.order_id === orderId
            ? {
                ...order,
                status: updatedOrder.status,
              }
            : order
        )
      );

      // Update selected order details
      setSelectedOrder((currentOrder) =>
        currentOrder?.order_id === orderId
          ? {
              ...currentOrder,
              status: updatedOrder.status,
            }
          : currentOrder
      );

      alert("Order status updated successfully!");

    } catch (error) {
      console.error(
        "Order status update error:",
        error
      );

      alert("Could not connect to the server");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading Orders...</h2>
        <p>Please wait.</p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && orders.length === 0) {
    return (
      <div className="dashboard-error">
        <h2>Orders</h2>

        <p>{error}</p>

        <button
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // =====================================================
  // ORDERS PAGE
  // =====================================================

  return (
    <>
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="dashboard-header">
        <div>
          <h1>Orders</h1>
          <p>Manage customer orders</p>
        </div>
      </div>

      {/* =================================================
          ORDER LIST
      ================================================= */}

      <section className="recent-orders">

        <h2>Order List</h2>

        {error && (
          <p className="dashboard-error-message">
            {error}
          </p>
        )}

        <table>

          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Status</th>
              <th>Actions</th>
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

                  {/* ====================================
                      STATUS
                  ==================================== */}

                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusUpdate(
                          order.order_id,
                          e.target.value
                        )
                      }
                    >
                      <option value="pending">
                        Pending
                      </option>

                      <option value="preparing">
                        Preparing
                      </option>

                      <option value="shipped">
                        Shipped
                      </option>

                      <option value="delivered">
                        Delivered
                      </option>
                    </select>
                  </td>

                  {/* ====================================
                      VIEW
                  ==================================== */}

                  <td>
                    <button
                      className="view-button"
                      onClick={() =>
                        handleView(order.order_id)
                      }
                    >
                      View
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">
                  No orders found.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </section>

      {/* =================================================
          ORDER DETAILS
      ================================================= */}

      {selectedOrder && (
        <section className="recent-orders">

          <h2>Order Details</h2>

          <table>

            <tbody>

              <tr>
                <th>Order ID</th>

                <td>
                  {selectedOrder.order_id}
                </td>
              </tr>

              <tr>
                <th>Customer</th>

                <td>
                  {selectedOrder.customer_name}
                </td>
              </tr>

              <tr>
                <th>Email</th>

                <td>
                  {selectedOrder.customer_email}
                </td>
              </tr>

              <tr>
                <th>Product</th>

                <td>
                  {selectedOrder.product}
                </td>
              </tr>

              <tr>
                <th>Status</th>

                <td>
                  {selectedOrder.status}
                </td>
              </tr>

            </tbody>

          </table>

        </section>
      )}

    </>
  );
}

export default Orders;
