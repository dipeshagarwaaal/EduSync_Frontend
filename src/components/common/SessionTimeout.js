import React, { useEffect, useCallback } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { useNotification } from '../../utils/NotificationContext';

const SessionTimeout = () => {
  const { logout, isAuthenticated } = useAuth();
  const notification = useNotification();

  const checkTokenExpiration = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      // If token is expired, logout user
      if (timeUntilExpiration <= 0) {
        logout('/login?expired=true');
        return;
      }

      // Show warning 5 minutes before expiration
      if (timeUntilExpiration <= 5 * 60 * 1000) {
        notification.warning('Your session will expire in 5 minutes. Please save your work.');
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
    }
  }, [logout, notification]);

  useEffect(() => {
    if (!isAuthenticated()) return;

    // Check token expiration every minute
    const interval = setInterval(checkTokenExpiration, 60 * 1000);
    
    // Initial check
    checkTokenExpiration();

    return () => clearInterval(interval);
  }, [isAuthenticated, checkTokenExpiration]);

  return null; // This component doesn't render anything
};

export default SessionTimeout; 