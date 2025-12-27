import React from 'react';
import { Link } from 'react-router-dom';

// Navigation bar component - shows at the top of every page
const Navbar = ({ user, setUser, cartCount }) => {
  
  // Function to log out the current user
  const logoutUser = () => {
    // Get current user data
    const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Remove login information from browser storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear user from app state (this will hide user menu)
    setUser(null);
  };

  return (
    <nav className="navbar">
      {/* Website logo/title - clicking goes to home page */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1>MarketPlace</h1>
      </Link>
      
      {/* Navigation menu */}
      <ul className="nav-links">
        {/* Home link - always visible */}
        <li>
          <Link to="/">Home</Link>
        </li>
        
        {/* Show different menu items based on if user is logged in */}
        {user ? (
          // Menu for logged in users
          <>
            <li>
              <Link to="/favorites">Favorites ❤️</Link>
            </li>
            <li>
              <Link to="/cart">Cart ({cartCount})</Link>
            </li>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <button onClick={logoutUser} className="btn">
                Logout
              </button>
            </li>
            <li>
              Welcome, {user.name}
            </li>
          </>
        ) : (
          // Menu for visitors (not logged in)
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;