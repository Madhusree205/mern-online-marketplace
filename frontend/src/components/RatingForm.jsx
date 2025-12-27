import React, { useState } from 'react';

const RatingForm = ({ product, orderId, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(product._id, orderId, rating, review);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ padding: '1rem', background: '#e8f5e8', borderRadius: '5px', margin: '0.5rem 0' }}>
        <p><strong>{product.name}</strong> - Rating submitted ✓</p>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '5px', margin: '0.5rem 0' }}>
      <h4>{product.name}</h4>
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
        
        <button type="submit" className="btn btn-success">
          Submit Rating
        </button>
      </form>
    </div>
  );
};

export default RatingForm;