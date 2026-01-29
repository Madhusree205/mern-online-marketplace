import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';

// Main home page component that shows all products - Updated for deployment
const Home = ({ addToCart, showNotification }) => {
  // State variables to store data
  const [allProducts, setAllProducts] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [userSearchText, setUserSearchText] = useState('');
  const [chosenCategory, setChosenCategory] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [userLikedProducts, setUserLikedProducts] = useState(new Set());
  
  const navigateToPage = useNavigate();

  // Load products when page opens or when user searches/filters
  useEffect(() => {
    loadAllProducts();
  }, [userSearchText, chosenCategory]);

  // Function to get products from server
  const loadAllProducts = async () => {
    try {
      // Prepare search parameters
      const searchParams = {};
      if (userSearchText) {
        searchParams.search = userSearchText;
      }
      if (chosenCategory) {
        searchParams.category = chosenCategory;
      }
      
      // Get filtered products from API
      const productsResponse = await productsAPI.getAll(searchParams);
      setAllProducts(productsResponse.data);
      
      // Get all categories for the dropdown filter
      const allProductsResponse = await productsAPI.getAll();
      const categoryList = allProductsResponse.data.map(product => product.category);
      const uniqueCategoryList = [...new Set(categoryList)];
      setAvailableCategories(uniqueCategoryList);
      
    } catch (error) {
      console.error('Something went wrong while loading products:', error);
    } finally {
      setIsPageLoading(false);
    }
  };

  // Function to handle when user likes a product
  const handleProductLike = async (productId) => {
    // Check if user is logged in
    const userToken = localStorage.getItem('token');
    if (!userToken) {
      showNotification('Please login to like products', 'info');
      return;
    }
    
    try {
      const likeResponse = await productsAPI.like(productId);
      
      if (likeResponse.data.liked) {
        // Add product to liked list
        setUserLikedProducts(previousLikes => new Set([...previousLikes, productId]));
      } else {
        // Remove product from liked list
        setUserLikedProducts(previousLikes => {
          const updatedLikes = new Set(previousLikes);
          updatedLikes.delete(productId);
          return updatedLikes;
        });
      }
      
      // Update the product list to show new like status
      setAllProducts(previousProducts => 
        previousProducts.map(product => {
          if (product._id === productId) {
            return {
              ...product, 
              likes: likeResponse.data.liked 
                ? [...(product.likes || []), 'current-user'] 
                : (product.likes || []).filter(userId => userId !== 'current-user')
            };
          }
          return product;
        })
      );
      
    } catch (error) {
      console.error('Error while liking product:', error);
      showNotification('Error liking product. Please try again.', 'error');
    }
  };

  // Function to handle buy now button click
  const handleBuyNowClick = (selectedProduct) => {
    // Check if user is logged in
    const userToken = localStorage.getItem('token');
    if (!userToken) {
      showNotification('Please login to buy products', 'info');
      return;
    }
    
    // Navigate to checkout page with product details
    navigateToPage('/checkout', { state: { product: selectedProduct } });
  };

  // Show loading message while products are being fetched
  if (isPageLoading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="container">
      {/* Page header with search and filter options */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Featured Products</h2>
        
        {/* Search box and category filter */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '1rem', 
          flexWrap: 'wrap' 
        }}>
          {/* Search input box */}
          <input
            type="text"
            placeholder="Search products..."
            value={userSearchText}
            onChange={(event) => setUserSearchText(event.target.value)}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '5px', 
              border: '1px solid #ddd', 
              flex: 1, 
              minWidth: '200px' 
            }}
          />
          
          {/* Category dropdown filter */}
          <select
            value={chosenCategory}
            onChange={(event) => setChosenCategory(event.target.value)}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '5px', 
              border: '1px solid #ddd' 
            }}
          >
            <option value="">All Categories</option>
            {availableCategories.map(categoryName => (
              <option key={categoryName} value={categoryName}>
                {categoryName}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Products display grid */}
      <div className="products-grid">
        {allProducts.map(singleProduct => (
          <div key={singleProduct._id} className="product-card">
            {/* Product image */}
            <img 
              src={singleProduct.image || 'https://via.placeholder.com/300x200'} 
              alt={singleProduct.name} 
            />
            
            {/* Product details */}
            <h3>{singleProduct.name}</h3>
            <p className="price">₹{singleProduct.price}</p>
            <p>{singleProduct.description.substring(0, 100)}...</p>
            <p><strong>Stock:</strong> {singleProduct.stock}</p>
            
            {/* View details button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link to={`/product/${singleProduct._id}`} className="btn">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
