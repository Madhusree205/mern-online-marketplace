import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RatingForm = ({ product, orderId, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(product._id, orderId, rating, review);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ padding: '1rem', background: '#e8f5e8', borderRadius: '5px', margin: '0.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src={product.image || 'https://via.placeholder.com/60x60'} 
            alt={product.name}
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'contain',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}
          />
          <p><strong>{product.name}</strong> - Rating submitted ✓</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '5px', margin: '0.5rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <img 
          src={product.image || 'https://via.placeholder.com/80x80'} 
          alt={product.name}
          style={{
            width: '80px',
            height: '80px',
            objectFit: 'contain',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}
        />
        <h4>{product.name}</h4>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Rating:</label>
          <select 
            value={rating} 
            onChange={(e) => setRating(parseInt(e.target.value))}
            style={{ padding: '0.5rem', borderRadius: '5px' }}
          >
            <option value={5}>⭐⭐⭐⭐⭐ (5 stars)</option>
            <option value={4}>⭐⭐⭐⭐ (4 stars)</option>
            <option value={3}>⭐⭐⭐ (3 stars)</option>
            <option value={2}>⭐⭐ (2 stars)</option>
            <option value={1}>⭐ (1 star)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Review:</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            required
            rows="3"
            placeholder="Write your review..."
            style={{ width: '100%', padding: '0.5rem', borderRadius: '5px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-success">
            Submit Rating
          </button>
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="btn btn-secondary"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default RatingForm;