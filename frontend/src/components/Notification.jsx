import React, { useEffect } from 'react';

// Notification component - shows messages to users
const Notification = ({ message, type, onClose }) => {
  
  // Automatically hide notification after 4 seconds
  useEffect(() => {
    if (message) {
      // Set a timer to hide the message
      const hideTimer = setTimeout(() => {
        onClose();
      }, 4000); // 4000 milliseconds = 4 seconds
      
      // Clean up timer when component unmounts or message changes
      return () => clearTimeout(hideTimer);
    }
  }, [message, onClose]);

  // Don't show anything if there's no message
  if (!message) {
    return null;
  }

  return (
    <div className={`notification notification-${type}`}>
      {/* The actual message text */}
      <span>{message}</span>
      
      {/* Close button (X) to manually hide notification */}
      <button onClick={onClose} className="notification-close">
        ×
      </button>
    </div>
  );
};

export default Notification;