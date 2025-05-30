import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Automatically attach token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Check if token expired header is present
      const isTokenExpired = error.response.headers['token-expired'] === 'true';
      
      if (error.response.status === 401 || isTokenExpired) {
        // Clear auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Save the current URL to redirect back after login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          sessionStorage.setItem('redirectAfterLogin', currentPath);
        }
        
        // Redirect to login with expired session parameter
        window.location.href = '/login?expired=true';
        return Promise.reject(error);
      }
      
      if (error.response.status === 403) {
        // Redirect to unauthorized page for forbidden access
        window.location.href = '/unauthorized';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
