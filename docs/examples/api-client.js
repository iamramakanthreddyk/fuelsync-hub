/**
 * FuelSync Hub API Client Example
 * 
 * This example demonstrates how to use the FuelSync Hub API with the JWT authentication system.
 */

// Create a simple API client
const createFuelSyncClient = (baseUrl = 'http://localhost:3001/api') => {
  // Store the auth token
  let authToken = null;
  
  // Helper function to make API requests
  const request = async (endpoint, options = {}) => {
    const url = `${baseUrl}${endpoint}`;
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Add auth token if available
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    
    // Make the request
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Parse the response
    const data = await response.json();
    
    // Check for errors
    if (!response.ok) {
      const error = new Error(data.message || 'API request failed');
      error.status = response.status;
      error.code = data.code;
      throw error;
    }
    
    return data;
  };
  
  return {
    // Auth methods
    auth: {
      // Login
      login: async (email, password) => {
        const response = await request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        
        // Store the token (remove "Bearer " prefix)
        authToken = response.data.token.replace('Bearer ', '');
        
        return response.data;
      },
      
      // Register
      register: async (name, email, password, planType) => {
        const response = await request('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, planType })
        });
        
        return response.data;
      },
      
      // Get current user
      getCurrentUser: async () => {
        const response = await request('/auth/me');
        return response.data.user;
      },
      
      // Logout
      logout: async () => {
        const response = await request('/auth/logout', {
          method: 'POST'
        });
        
        // Clear the token
        authToken = null;
        
        return response.data;
      }
    },
    
    // Stations methods
    stations: {
      // Get all stations
      getAll: async () => {
        const response = await request('/stations');
        return response.data;
      },
      
      // Get station by ID
      getById: async (id) => {
        const response = await request(`/stations/${id}`);
        return response.data;
      },
      
      // Create station
      create: async (stationData) => {
        const response = await request('/stations', {
          method: 'POST',
          body: JSON.stringify(stationData)
        });
        
        return response.data;
      },
      
      // Update station
      update: async (id, stationData) => {
        const response = await request(`/stations/${id}`, {
          method: 'PUT',
          body: JSON.stringify(stationData)
        });
        
        return response.data;
      },
      
      // Delete station
      delete: async (id) => {
        const response = await request(`/stations/${id}`, {
          method: 'DELETE'
        });
        
        return response.data;
      }
    },
    
    // Dashboard methods
    dashboard: {
      // Get dashboard stats
      getStats: async (stationId) => {
        const query = stationId ? `?stationId=${stationId}` : '';
        const response = await request(`/dashboard/stats${query}`);
        return response.data;
      }
    }
  };
};

// Example usage
async function example() {
  try {
    // Create client
    const client = createFuelSyncClient();
    
    // Login
    const authData = await client.auth.login('owner@example.com', 'password123');
    console.log('Logged in as:', authData.user.email);
    
    // Get current user
    const user = await client.auth.getCurrentUser();
    console.log('Current user:', user);
    
    // Get stations
    const stations = await client.stations.getAll();
    console.log('Stations:', stations);
    
    // Get dashboard stats
    const stats = await client.dashboard.getStats(stations[0]?.id);
    console.log('Dashboard stats:', stats);
    
    // Logout
    await client.auth.logout();
    console.log('Logged out');
  } catch (error) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
  }
}

// Run the example
example();