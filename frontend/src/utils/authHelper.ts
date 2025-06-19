// frontend/src/utils/authHelper.ts
interface TokenPayload {
  id: string;
  email: string;
  role: string;
  tenant_id?: string;
  exp: number;
  iat: number;
}

/**
 * Store authentication token
 */
export const storeToken = (token: string): void => {
  if (!token) {
    console.error('No token provided to storeToken');
    return;
  }
  
  // Remove 'Bearer ' prefix if present
  const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
  
  try {
    localStorage.setItem('token', cleanToken);
    console.log('Token stored successfully');
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

/**
 * Get authentication token
 */
export const getToken = (): string | null => {
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
export const removeToken = (): void => {
  try {
    localStorage.removeItem('token');
    console.log('Token removed successfully');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

/**
 * Parse JWT token
 */
export const parseToken = (token: string): TokenPayload | null => {
  if (!token) {
    console.warn('No token provided to parseToken');
    return null;
  }
  
  try {
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
      
      return JSON.parse(jsonPayload) as TokenPayload;
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
 */
export const getUserRole = (): string | null => {
  const token = getToken();
  if (!token) return null;
  
  const payload = parseToken(token);
  return payload?.role || null;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (): boolean => {
  const token = getToken();
  if (!token) return true;
  
  const payload = parseToken(token);
  if (!payload || !payload.exp) return true;
  
  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  return Date.now() >= expirationTime;
};

/**
 * Create Authorization header
 */
export const authHeader = (): Record<string, string> => {
  const token = getToken();
  if (!token) return {};
  
  return { Authorization: `Bearer ${token}` };
};

/**
 * Get user info from token
 */
export const getUserInfo = (): Partial<TokenPayload> | null => {
  const token = getToken();
  if (!token) return null;
  
  const payload = parseToken(token);
  if (!payload) return null;
  
  return {
    id: payload.id,
    email: payload.email,
    role: payload.role,
    tenant_id: payload.tenant_id
  };
};

/**
 * Debug authentication
 */
export const debugAuth = (): void => {
  const token = getToken();
  console.log('Token exists:', !!token);
  
  if (token) {
    console.log('Token:', token);
    
    const payload = parseToken(token);
    console.log('Token payload:', payload);
    
    const expired = isTokenExpired();
    console.log('Token expired:', expired);
    
    const role = getUserRole();
    console.log('User role:', role);
  }
};