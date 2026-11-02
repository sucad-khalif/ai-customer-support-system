
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerChat from "./CustomerChat";

const menu = [
  {
    id: 1,
    name: "Hamburger",
    price: 5.0,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Chicken Burger",
    price: 6.5,
    image:
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "French Fries",
    price: 2.5,
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Pizza",
    price: 8.0,
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    name: "Fresh Juice",
    price: 2.0,
    image:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80",
  },
];

function MyOrders() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);

  // =========================
  // CART
  // =========================
  const [cart, setCart] = useState([]);

  // =========================
  // CHECKOUT
  // =========================
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [checkoutError, setCheckoutError] = useState("");

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
  // ADD TO CART
  // =========================
  const addToCart = (product) => {
    setCheckoutError("");
    setOrderSuccess(null);

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  // =========================
  // INCREASE / DECREASE
  // =========================
  const changeQuantity = (productId, amount) => {
    setCheckoutError("");
    setOrderSuccess(null);

    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.id !== productId) {
            return item;
          }

          return {
            ...item,
            quantity: item.quantity + amount,
          };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // =========================
  // CART COUNT
  // =========================
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // =========================
  // CART TOTAL
  // =========================
  const cartTotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  // =========================
  // CHECKOUT
  // =========================
  const handleCheckout = async () => {
    if (isCheckingOut) {
      return;
    }

    if (!customer?.id) {
      setCheckoutError(
        "Customer information is missing. Please login again."
      );
      return;
    }

    if (cart.length === 0) {
      setCheckoutError(
        "Your cart is empty. Please add food first."
      );
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError("");
    setOrderSuccess(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_id: customer.id,
            items: cart.map((item) => ({
              product_name: item.name,
              quantity: item.quantity,
              unit_price: item.price,
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Could not place your order."
        );
      }

      console.log("Order created:", data);

      setOrderSuccess(data);

      // Clear cart after successful order
      setCart([]);
    } catch (error) {
      console.error("Checkout error:", error);

      setCheckoutError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (!customer) {
    return (
      <div className="customer-page-loading">
        <h2>Loading...</h2>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================
  return (
    <div className="my-orders-page">

      {/* =========================
          AI CUSTOMER SUPPORT
      ========================= */}
      <CustomerChat customer={customer} />

      {/* =========================
          NAVBAR
      ========================= */}
      <nav className="customer-navbar">

        <div
          className="customer-logo"
          onClick={() =>
            navigate("/customer-dashboard")
          }
        >
          🍕 PIZZA KITCHEN
        </div>

        <div className="customer-nav-links">

          <button
            type="button"
            onClick={() =>
              navigate("/customer-dashboard")
            }
          >
            HOME
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/my-orders")
            }
          >
            MENU
          </button>

          <button
            type="button"
            className="active"
          >
            MY ORDERS
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/customer-chat")
            }
          >
            SUPPORT
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
          >
            PROFILE
          </button>

        </div>
      </nav>

      {/* =========================
          HEADER
      ========================= */}
      <section className="my-orders-header">

        <span className="orders-small-title">
          PIZZA KITCHEN
        </span>

        <h1>My Orders</h1>

        <p>
          Welcome back, {customer.name}! Choose
          your favorite food and add it to your
          cart.
        </p>

      </section>

      {/* =========================
          MAIN CONTAINER
      ========================= */}
      <main className="my-orders-container">

        <div className="order-layout">

          {/* =========================
              MENU
          ========================= */}
          <section className="menu-section">

            <h2>Available Items</h2>

            <div className="menu-grid">

              {menu.map((product) => (

                <article
                  className="menu-card"
                  key={product.id}
                >

                  {/* FOOD IMAGE */}
                  <div className="menu-card-image">

                    <img
                      src={product.image}
                      alt={product.name}
                    />

                  </div>

                  {/* FOOD INFORMATION */}
                  <div className="menu-card-content">

                    <h3>{product.name}</h3>

                    <p className="menu-price">
                      ${product.price.toFixed(2)}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        addToCart(product)
                      }
                      disabled={isCheckingOut}
                    >
                      + Add to Cart
                    </button>

                  </div>

                </article>

              ))}

            </div>

          </section>

          {/* =========================
              CART
          ========================= */}
          <aside className="cart-section">

            <div className="cart-heading">

              <h2>
                🛒 Your Cart
              </h2>

              <span className="cart-count">
                {cartCount}
              </span>

            </div>

            {/* EMPTY CART */}
            {cart.length === 0 && (
              <div className="empty-cart">

                <div className="empty-cart-icon">
                  🛒
                </div>

                <h3>Your cart is empty</h3>

                <p>
                  Add your favorite food from
                  the menu to get started.
                </p>

              </div>
            )}

            {/* CART ITEMS */}
            {cart.length > 0 && (
              <div className="cart-items">

                {cart.map((item) => (

                  <div
                    className="cart-item"
                    key={item.id}
                  >

                    <div className="cart-item-info">

                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        $
                        {(
                          item.price *
                          item.quantity
                        ).toFixed(2)}
                      </span>

                    </div>

                    <div className="quantity-controls">

                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(
                            item.id,
                            -1
                          )
                        }
                        disabled={isCheckingOut}
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(
                            item.id,
                            1
                          )
                        }
                        disabled={isCheckingOut}
                      >
                        +
                      </button>

                    </div>

                  </div>

                ))}

              </div>
            )}

            {/* TOTAL + CHECKOUT */}
            {cart.length > 0 && (
              <>

                <div className="cart-total">

                  <span>Total</span>

                  <strong>
                    ${cartTotal.toFixed(2)}
                  </strong>

                </div>

                <button
                  type="button"
                  className="checkout-button"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut
                    ? "Placing Order..."
                    : "Checkout"}
                </button>

              </>
            )}

            {/* ERROR */}
            {checkoutError && (
              <p
                role="alert"
                className="checkout-error"
              >
                {checkoutError}
              </p>
            )}

            {/* SUCCESS */}
            {orderSuccess && (

              <div
                className="order-success"
                role="status"
              >

                <h3>
                  ✅ Order placed successfully!
                </h3>

                <p>
                  Order Number:
                  <strong>
                    {" "}
                    {orderSuccess.order_id}
                  </strong>
                </p>

                <p>
                  Total: $
                  {Number(
                    orderSuccess.total
                  ).toFixed(2)}
                </p>

                <p>
                  Status:{" "}
                  {orderSuccess.status}
                </p>

                <p>
                  Thank you for your order,
                  {" "}
                  {customer.name}!
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/orders/${orderSuccess.order_id}`
                    )
                  }
                >
                  VIEW ORDER
                </button>

              </div>

            )}

          </aside>

        </div>

      </main>

      {/* =========================
          FOOTER
      ========================= */}
      <footer className="customer-footer">

        <h2>🍕 PIZZA KITCHEN</h2>

        <p>
          Fresh food made just for you.
        </p>

        <p>
          © 2026 Pizza Kitchen.
          All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default MyOrders;