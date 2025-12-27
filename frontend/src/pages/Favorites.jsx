import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';

const Favorites = ({ addToCart, showNotification }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      const savedFavorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || '[]');
      setFavorites(savedFavorites);
    }
    setLoading(false);
  };

  const removeFavorite = (productId) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedFavorites = favorites.filter(fav => fav._id !== productId);
    setFavorites(updatedFavorites);
    if (user.id) {
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updatedFavorites));
    }
    showNotification('Removed from favorites', 'info');
  };

  const handleBuyNow = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please login to buy products', 'info');
      return;
    }
    
    const address = prompt('Enter shipping address:');
    const phone = prompt('Enter phone number:');
    
    if (address && phone) {
      try {
        await productsAPI.buyNow(product._id, {
          quantity: 1,
          shippingAddress: address,
          phoneNumber: phone
        });
        showNotification('Order placed successfully!', 'success');
      } catch (error) {
        showNotification('Error placing order: ' + (error.response?.data?.message || 'Unknown error'), 'error');
      }
    }
  };

  if (loading) return <div className="loading">Loading favorites...</div>;

  if (favorites.length === 0) {
    return (
      <div className="container">
        <h2>My Favorites</h2>
        <p>No favorite products yet. Start adding some!</p>
        <Link to="/" className="btn">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>My Favorites</h2>
      <div className="products-grid">
        {favorites.map(product => (
          <div key={product._id} className="product-card">
            <img 
              src={product.image || 'https://via.placeholder.com/300x200'} 
              alt={product.name} 
            />
            <h3>{product.name}</h3>
            <p className="price">₹{product.price}</p>
            <p>{product.description.substring(0, 100)}...</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              <Link to={`/product/${product._id}`} className="btn">
                View Details
              </Link>
              <button 
                onClick={() => addToCart(product)} 
                className="btn"
              >
                Add to Cart
              </button>
              <button 
                onClick={() => handleBuyNow(product)} 
                className="btn btn-success"
              >
                Buy Now
              </button>
              <button 
                onClick={() => removeFavorite(product._id)} 
                className="btn btn-danger"
              >
                💔
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;