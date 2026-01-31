import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productsAPI, ordersAPI } from '../services/api';

const Checkout = ({ showNotification }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { product, cart, total } = location.state || {};
  
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    quantity: 1
  });
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showQR, setShowQR] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (product) {
        // Buy now single product
        await productsAPI.buyNow(product._id, {
          quantity: formData.quantity,
          shippingAddress: formData.address,
          phoneNumber: formData.phone
        });
      } else if (cart) {
        // Cart checkout
        await ordersAPI.create({
          items: cart.map(item => ({
            product: item._id,
            quantity: item.quantity,
            price: item.price
          })),
          total,
          shippingAddress: formData.address,
          phoneNumber: formData.phone
        });
      }
      
      // Clear cart if it was a cart checkout
      if (cart) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
          localStorage.setItem(`cart_${user.id}`, JSON.stringify([]));
        }
      }
      
      showNotification('Order placed successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      showNotification('Error placing order: ' + (error.response?.data?.message || 'Unknown error'), 'error');
    }
  };

  if (!product && !cart) {
    return (
      <div className="container">
        <h2>Invalid Checkout</h2>
        <p>No items to checkout</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Checkout</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h3>Order Summary</h3>
          {product ? (
            <div className="order-card">
              <h4>{product.name}</h4>
              <p>Price: ₹{product.price}</p>
              <p>Quantity: {formData.quantity}</p>
              <p><strong>Total: ₹{(product.price * formData.quantity).toFixed(2)}</strong></p>
            </div>
          ) : (
            <div>
              {cart.map(item => (
                <div key={item._id} className="order-card">
                  <h4>{item.name}</h4>
                  <p>Price: ₹{item.price} x {item.quantity}</p>
                  <p>Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="order-card">
                <h3>Total: ₹{total.toFixed(2)}</h3>
              </div>
            </div>
          )}
        </div>

        <div>
          <form onSubmit={handleSubmit} className="form">
            <h3>Shipping Details</h3>
            
            <div className="form-group">
              <label>Shipping Address:</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                rows="4"
                placeholder="Enter your complete address"
              />
            </div>
            
            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="Enter your phone number"
              />
            </div>
            
            {product && (
              <div className="form-group">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Payment Method:</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setShowQR(false);
                    }}
                  />
                  Cash on Delivery
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="radio"
                    value="gpay"
                    checked={paymentMethod === 'gpay'}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setShowQR(true);
                    }}
                  />
                  GPay
                </label>
              </div>
            </div>
            
            {showQR && (
              <div className="form-group">
                <label>Scan QR Code to Pay:</label>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1rem', 
                  border: '2px dashed #007bff', 
                  borderRadius: '10px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{
                    width: '200px',
                    height: '200px',
                    margin: '0 auto',
                    backgroundColor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    borderRadius: '10px'
                  }}>
                    QR CODE<br/>DUMMY<br/>PAYMENT
                  </div>
                  <p style={{ marginTop: '1rem', color: '#666' }}>Amount: ₹{product ? (product.price * formData.quantity).toFixed(2) : total?.toFixed(2)}</p>
                  <p style={{ fontSize: '12px', color: '#999' }}>This is a demo QR code</p>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-success">
                {paymentMethod === 'cod' ? 'Place Order' : 'Confirm Payment & Order'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;