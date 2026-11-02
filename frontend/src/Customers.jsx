
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // =====================================================
  // GET STAFF TOKEN
  // =====================================================

  const token = localStorage.getItem("staff_token");

  // =====================================================
  // LOAD CUSTOMERS
  // =====================================================

  useEffect(() => {
    if (!token) {
      navigate("/staff-login");
      return;
    }

    const loadCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://127.0.0.1:8000/customers",
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
          throw new Error("Failed to load customers");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setCustomers(data);
        } else {
          setCustomers([]);
        }

      } catch (error) {
        console.error("Failed to load customers:", error);
        setError("Unable to load customers.");
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [token, navigate]);

  // =====================================================
  // VIEW CUSTOMER DETAILS
  // =====================================================

  const handleView = async (customerId) => {
    try {
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/customers/${customerId}`,
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
        throw new Error("Failed to load customer details");
      }

      const data = await response.json();

      setSelectedCustomer(data);

    } catch (error) {
      console.error(
        "Failed to load customer details:",
        error
      );

      setError("Unable to load customer details.");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading Customers...</h2>
        <p>Please wait.</p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && customers.length === 0) {
    return (
      <div className="dashboard-error">
        <h2>Customers</h2>
        <p>{error}</p>

        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  // =====================================================
  // CUSTOMER PAGE
  // =====================================================

  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Customers</h1>
          <p>Manage customer information</p>
        </div>
      </div>

      {/* =================================================
          CUSTOMER LIST
      ================================================= */}

      <section className="recent-orders">

        <h2>Customer List</h2>

        {error && (
          <p className="dashboard-error-message">
            {error}
          </p>
        )}

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id}>

                  <td>
                    {customer.id}
                  </td>

                  <td>
                    {customer.name}
                  </td>

                  <td>
                    {customer.email}
                  </td>

                  <td>
                    <button
                      className="view-button"
                      onClick={() =>
                        handleView(customer.id)
                      }
                    >
                      View
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">
                  No customers found.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </section>

      {/* =================================================
          CUSTOMER DETAILS
      ================================================= */}

      {selectedCustomer && (
        <section className="recent-orders">

          <h2>Customer Details</h2>

          <table>

            <tbody>

              <tr>
                <th>Name</th>
                <td>
                  {selectedCustomer.name}
                </td>
              </tr>

              <tr>
                <th>Email</th>
                <td>
                  {selectedCustomer.email}
                </td>
              </tr>

              <tr>
                <th>Order ID</th>
                <td>
                  {selectedCustomer.orders?.[0]?.order_id ||
                    "No order"}
                </td>
              </tr>

              <tr>
                <th>Product</th>
                <td>
                  {selectedCustomer.orders?.[0]?.product ||
                    "No product"}
                </td>
              </tr>

              <tr>
                <th>Order Status</th>
                <td>
                  {selectedCustomer.orders?.[0]?.status ||
                    "No status"}
                </td>
              </tr>

              <tr>
                <th>Conversation ID</th>
                <td>
                  {selectedCustomer.conversations?.[0]
                    ?.conversation_id ||
                    "No conversation"}
                </td>
              </tr>

              <tr>
                <th>Intent</th>
                <td>
                  {selectedCustomer.conversations?.[0]
                    ?.current_intent ||
                    "No intent"}
                </td>
              </tr>

              <tr>
                <th>State</th>
                <td>
                  {selectedCustomer.conversations?.[0]
                    ?.state ||
                    "No state"}
                </td>
              </tr>

            </tbody>

          </table>

        </section>
      )}

    </>
  );
}

export default Customers;
