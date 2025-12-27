import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';

const ProductCard = ({ product, onProductUpdate, addToCart }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(product.likes?.length || 0);

  const handleLike = async () => {
    try {
      const response = await productsAPI.like(product._id);
      setLiked(response.data.liked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      console.error('Error liking product:', error);
    }
  };

  const handleBuyNow = async () => {
    const address = prompt('Enter shipping address:');
    const phone = prompt('Enter phone number:');
    
    if (address && phone) {
      try {
        await productsAPI.buyNow(product._id, {
          quantity: 1,
          shippingAddress: address,
          phoneNumber: phone
        });
        alert('Order placed successfully!');
        if (onProductUpdate) onProductUpdate();
      } catch (error) {
        alert('Error placing order: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  return (
    <div className="product-card">
      <img 
        src={product.image || 'https://via.placeholder.com/300x200'} 
        alt={product.name} 
      />
      <h3>{product.name}</h3>
      <p className="price">₹{product.price}</p>
      <p>{product.description.substring(0, 100)}...</p>
      <p><strong>Stock:</strong> {product.stock}</p>
      <p><strong>Likes:</strong> {likesCount}</p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
        <Link to={`/product/${product._id}`} className="btn">
          View Details
        </Link>
        <button 
          onClick={() => addToCart(product)} 
          className="btn"
          disabled={product.stock === 0}
        >
          Add to Cart
        </button>
        <button 
          onClick={handleBuyNow} 
          className="btn btn-success"
          disabled={product.stock === 0}
        >
          Buy Now
        </button>
        <button 
          onClick={handleLike} 
          className={`btn ${liked ? 'btn-danger' : 'btn-secondary'}`}
        >
          {liked ? '❤️' : '🤍'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;