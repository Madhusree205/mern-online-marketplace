import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, ratingsAPI } from '../services/api';

const ProductDetail = ({ addToCart, showNotification }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsAPI.getById(id);
        setProduct(response.data);
        
        // Check if product is in favorites
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
          const favorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || '[]');
          setIsFavorite(favorites.some(fav => fav._id === response.data._id));
        }
        
        // Fetch ratings
        const ratingsResponse = await ratingsAPI.getByProduct(response.data._id);
        setRatings(ratingsResponse.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const toggleFavorite = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please login to add favorites', 'info');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;
    
    let favorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || '[]');
    
    if (isFavorite) {
      favorites = favorites.filter(fav => fav._id !== product._id);
      setIsFavorite(false);
      showNotification('Removed from favorites', 'info');
    } else {
      favorites.push(product);
      setIsFavorite(true);
      showNotification('Added to favorites!', 'success');
    }
    
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites));
  };

  const navigate = useNavigate();

  const handleBuyNow = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please login to buy products', 'info');
      return;
    }
    
    navigate('/checkout', { state: { product } });
  };

  if (loading) return <div className="loading">Loading product details...</div>;
  if (!product) return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-secondary"
        >
          ← Back
        </button>
        <span>Product not found</span>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-secondary"
        >
          ← Back
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <img 
            src={product.image || 'https://via.placeholder.com/400x300'} 
            alt={product.name}
            style={{ width: '100%', borderRadius: '8px' }}
          />
        </div>
        <div>
          <h1>{product.name}</h1>
          <p className="price" style={{ fontSize: '2rem', margin: '1rem 0' }}>
            ₹{product.price}
          </p>
          <p style={{ marginBottom: '1rem' }}>{product.description}</p>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Seller:</strong> {product.seller?.name}</p>
          <p><strong>Stock:</strong> {product.stock} available</p>
          
          {/* Ratings Section */}
          <div style={{ marginTop: '2rem' }}>
            <h3>Customer Reviews</h3>
            {ratings.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <div>
                <p><strong>Average Rating:</strong> {(ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)} ⭐ ({ratings.length} reviews)</p>
                {ratings.map(rating => (
                  <div key={rating._id} style={{ border: '1px solid #eee', padding: '1rem', margin: '0.5rem 0', borderRadius: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{rating.user.name}</strong>
                      <span>{'⭐'.repeat(rating.rating)}</span>
                    </div>
                    <p style={{ marginTop: '0.5rem' }}>{rating.review}</p>
                    <small style={{ color: '#666' }}>{new Date(rating.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                addToCart(product);
                showNotification('Product added to cart!', 'success');
              }} 
              className="btn"
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            
            <button 
              onClick={handleBuyNow}
              className="btn btn-success"
              disabled={product.stock === 0}
            >
              Buy Now
            </button>
            
            <button 
              onClick={toggleFavorite}
              className={`btn ${isFavorite ? 'btn-danger' : 'btn-secondary'}`}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;