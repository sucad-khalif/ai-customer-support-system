
import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import CustomerChat from "./CustomerChat";

const menu = [
  { id: 1, name: "Hamburger", price: 5.0 },
  { id: 2, name: "Chicken Burger", price: 6.5 },
  { id: 3, name: "French Fries", price: 2.5 },
  { id: 4, name: "Pizza", price: 8.0 },
  { id: 5, name: "Fresh Juice", price: 2.0 },
];

function PlaceOrder() {
  const location = useLocation();
  const customer = location.state?.customer;

  const [cart, setCart] = useState([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [checkoutError, setCheckoutError] = useState("");

  // Add a product to the cart.
  const addToCart = (product) => {
    setCheckoutError("");
    setOrderSuccess(null);

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  // Increase or decrease product quantity.
  const changeQuantity = (productId, amount) => {
    setCheckoutError("");
    setOrderSuccess(null);

    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Calculate total quantity of items.
  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Calculate cart total.
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Send the order to FastAPI.
  const handleCheckout = async () => {
    if (isCheckingOut) return;

    if (cart.length === 0) {
      setCheckoutError("Your cart is empty.");
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

      setOrderSuccess(data);
      setCart([]);
    } catch (error) {
      setCheckoutError(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Require customer registration before ordering.
  if (!customer) {
    return (
      <main className="customer-order-page">
        <h1>Please register first</h1>
        <p>
          Your customer information is needed before ordering.
        </p>
        <Link to="/register">Go to Registration</Link>
      </main>
    );
  }

  return (
    <main className="customer-order-page">
      <header className="customer-order-header">
        <div>
          <h1>Our Menu</h1>
          <p>Welcome, {customer.name}!</p>
          <p>
            Choose your favorite food and add it to your cart.
          </p>
        </div>

        <div className="customer-id">
          Customer ID: {customer.id}
        </div>
      </header>

      <div className="order-layout">
        {/* Available menu */}
        <section className="menu-section">
          <h2>Available Items</h2>

          <div className="menu-grid">
            {menu.map((product) => (
              <article className="menu-card" key={product.id}>
                <div className="menu-icon">🍽️</div>

                <h3>{product.name}</h3>

                <p className="menu-price">
                  ${product.price.toFixed(2)}
                </p>

                <button
                  type="button"
                  onClick={() => addToCart(product)}
                  disabled={isCheckingOut}
                >
                  Add to Cart
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Shopping cart */}
        <aside className="cart-section">
          <h2>🛒 Your Cart ({cartCount})</h2>

          {cart.length === 0 ? (
            <p className="empty-cart">
              Your cart is empty. Add an item to get started.
            </p>
          ) : (
            <>
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-info">
                    <strong>{item.name}</strong>

                    <span>
                      $
                      {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <div className="quantity-controls">
                    <button
                      type="button"
                      aria-label={`Remove one ${item.name}`}
                      onClick={() => changeQuantity(item.id, -1)}
                      disabled={isCheckingOut}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      aria-label={`Add one ${item.name}`}
                      onClick={() => changeQuantity(item.id, 1)}
                      disabled={isCheckingOut}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <div className="cart-total">
                <span>Total</span>
                <strong>${total.toFixed(2)}</strong>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut || cart.length === 0}
              >
                {isCheckingOut
                  ? "Placing Order..."
                  : "Checkout"}
              </button>
            </>
          )}

          {/* Checkout error */}
          {checkoutError && (
            <p role="alert" className="checkout-error">
              {checkoutError}
            </p>
          )}

          {/* Successful order confirmation */}
          {orderSuccess && (
            <div className="order-success" role="status">
              <h3>Order placed successfully!</h3>

              <p>
                Order Number:{" "}
                <strong>{orderSuccess.order_id}</strong>
              </p>

              <p>
                Total: $
                {Number(orderSuccess.total).toFixed(2)}
              </p>

              <p>
                Status: {orderSuccess.status}
              </p>

              <p>
                Thank you for your order, {customer.name}!
              </p>
            </div>
          )}
        </aside>
      </div>
      <CustomerChat
  customer={customer}
  orderId={orderSuccess?.order_id ?? null}
/>
    </main>
  );
}

export default PlaceOrder;