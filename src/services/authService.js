import api from './api';
import apiConfig from '../config/apiConfig';

const { AUTH } = apiConfig.API_ENDPOINTS;

/**
 * Register a new user
 */
const register = async (userData) => {
  try {
    const dataToSend = userData;

    const response = await api.post(AUTH.REGISTER, dataToSend, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Login and store token + user data
 */
const login = async (credentials) => {
  try {
    const dataToSend = credentials;

    const response = await api.post(AUTH.LOGIN, dataToSend, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const { token, user } = response.data;

    if (token) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Attach token to axios headers globally
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return { token, user };
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Log out the user
 */
const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

/**
 * Get current user object
 */
const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (err) {
    console.error('Error parsing user data from localStorage:', err);
    return null;
  }
};

/**
 * Check if a user is authenticated
 */
const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  const user = getCurrentUser();
  return !!token && !!user;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated
};

export default authService;
