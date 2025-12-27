import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Notification from './components/Notification.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Favorites from './pages/Favorites.jsx';
import Checkout from './pages/Checkout.jsx';
import './App.css';

// Main App component - this is the heart of our marketplace
function App() {
  // Store current logged in user information
  const [currentUser, setCurrentUser] = useState(null);
  
  // Store items in shopping cart
  const [shoppingCart, setShoppingCart] = useState([]);
  
  // Store notification messages to show to user
  const [notificationMessage, setNotificationMessage] = useState({ 
    message: '', 
    type: '' 
  });

  // When app starts, check if user was already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUserData = localStorage.getItem('user');
    
    if (savedToken && savedUserData) {
      const userInfo = JSON.parse(savedUserData);
      setCurrentUser(userInfo);
      
      // Load this user's shopping cart from storage
      const userShoppingCart = JSON.parse(
        localStorage.getItem(`cart_${userInfo.id}`) || '[]'
      );
      setShoppingCart(userShoppingCart);
    }
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        `cart_${currentUser.id}`, 
        JSON.stringify(shoppingCart)
      );
    }
  }, [shoppingCart, currentUser]);

  // Function to show messages to user
  const displayNotification = (messageText, messageType = 'info') => {
    setNotificationMessage({ message: messageText, type: messageType });
  };

  // Function to hide notification messages
  const hideNotificationMessage = () => {
    setNotificationMessage({ message: '', type: '' });
  };

  // Function to add products to shopping cart
  const addProductToCart = (selectedProduct) => {
    setShoppingCart(previousCart => {
      // Check if product is already in cart
      const existingItem = previousCart.find(
        cartItem => cartItem._id === selectedProduct._id
      );
      
      if (existingItem) {
        // If product exists, increase quantity
        return previousCart.map(cartItem => 
          cartItem._id === selectedProduct._id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      
      // If new product, add it to cart with quantity 1
      return [...previousCart, { ...selectedProduct, quantity: 1 }];
    });
    
    displayNotification('Product added to cart!', 'success');
  };

  return (
    <Router>
      <div className="App">
        {/* Navigation bar at the top */}
        <Navbar 
          user={currentUser} 
          setUser={setCurrentUser} 
          cartCount={shoppingCart.length} 
        />
        
        {/* Notification messages */}
        <Notification 
          message={notificationMessage.message} 
          type={notificationMessage.type} 
          onClose={hideNotificationMessage} 
        />
        
        {/* Different pages of our website */}
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                addToCart={addProductToCart} 
                showNotification={displayNotification} 
              />
            } 
          />
          <Route 
            path="/login" 
            element={
              <Login 
                setUser={setCurrentUser} 
                showNotification={displayNotification} 
              />
            } 
          />
          <Route 
            path="/register" 
            element={
              <Register 
                setUser={setCurrentUser} 
                showNotification={displayNotification} 
              />
            } 
          />
          <Route 
            path="/product/:id" 
            element={
              <ProductDetail 
                addToCart={addProductToCart} 
                showNotification={displayNotification} 
              />
            } 
          />
          <Route 
            path="/cart" 
            element={
              <Cart 
                cart={shoppingCart} 
                setCart={setShoppingCart} 
                showNotification={displayNotification} 
              />
            } 
          />
          <Route 
            path="/favorites" 
            element={
              <Favorites 
                addToCart={addProductToCart} 
                showNotification={displayNotification} 
              />
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <Checkout 
                showNotification={displayNotification} 
              />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                user={currentUser} 
                showNotification={displayNotification} 
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;