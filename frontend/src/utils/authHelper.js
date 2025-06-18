// frontend/src/utils/authHelper.js

/**
 * Helper functions for authentication
 */

/**
 * Store authentication token
 * @param {string} token - JWT token
 */
export const storeToken = (token) => {
  if (!token) {
    console.error('No token provided to storeToken');
    return;
  }
  
  try {
    localStorage.setItem('token', token);
    console.log('Token stored successfully');
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

/**
 * Get authentication token
 * @returns {string|null} JWT token or null if not found
 */
export const getToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage');
    }
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Remove authentication token (logout)
 */
export const removeToken = () => {
  try {
    localStorage.removeItem('token');
    console.log('Token removed successfully');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

/**
 * Parse JWT token
 * @param {string} token - JWT token
 * @returns {object|null} Parsed token payload or null if invalid
 */
export const parseToken = (token) => {
  if (!token) {
    console.warn('No token provided to parseToken');
    return null;
  }
  
  try {
    // Check if token has the correct format (three parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format: not a valid JWT');
      return null;
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    try {
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding token payload:', e);
      return null;
    }
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Get user role from token
 * @returns {string|null} User role or null if not authenticated
 */
export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;
  
  const payload = parseToken(token);
  return payload?.role || null;
};

/**
 * Check if token is expired
 * @returns {boolean} True if token is expired, false otherwise
 */
export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;
  
  const payload = parseToken(token);
  if (!payload || !payload.exp) return true;
  
  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  return Date.now() >= expirationTime;
};

/**
 * Create Authorization header
 * @returns {object} Headers object with Authorization header
 */
export const authHeader = () => {
  const token = getToken();
  if (!token) return {};
  
  // Validate token format before returning
  if (!token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/)) {
    console.error('Invalid token format in authHeader');
    removeToken(); // Remove invalid token
    return {};
  }
  
  return { Authorization: `Bearer ${token}` };
};

/**
 * Debug authentication
 * Logs authentication information to console
 */
export const debugAuth = () => {
  const token = getToken();
  console.log('Token exists:', !!token);
  
  if (token) {
    console.log('Token:', token);
    
    // Check token format
    const isValidFormat = token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/);
    console.log('Valid token format:', isValidFormat);
    
    const payload = parseToken(token);
    console.log('Token payload:', payload);
    
    const expired = isTokenExpired();
    console.log('Token expired:', expired);
    
    const role = getUserRole();
    console.log('User role:', role);
  }
};