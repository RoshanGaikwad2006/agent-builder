import apiClient from './apiClient';


export const authApi = {
  /**
   * Register a new user account.
   */
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Log in user and acquire JWT tokens.
   */
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Get currently logged-in user profile specs.
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};
