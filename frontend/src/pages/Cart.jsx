import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';

const Cart = ({ cart, setCart, showNotification }) => {
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item._id !== id));
    } else {
      setCart(cart.map(item => 
        item._id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout', { state: { cart, total } });
  };

  if (cart.length === 0) {
    return (
      <div className="container">
        <h2>Your Cart</h2>
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Your Cart</h2>
      {cart.map(item => (
        <div key={item._id} className="cart-item">
          <div>
            <h4>{item.name}</h4>
            <p className="price">₹{item.price}</p>
          </div>
          <div className="cart-controls">
            <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
            <span style={{ margin: '0 1rem', fontWeight: 'bold' }}>{item.quantity}</span>
            <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
          </div>
          <div>
            <strong className="price">₹{(item.price * item.quantity).toFixed(2)}</strong>
          </div>
        </div>
      ))}
      
      <div className="total-section">
        <h3>Total: ₹{total.toFixed(2)}</h3>
        <button onClick={handleCheckout} className="btn btn-success" style={{ marginTop: '1rem' }}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;