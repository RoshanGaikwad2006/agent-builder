import apiClient from './apiClient';

export const chatApi = {
  /**
   * Sends a query to the FastAPI /chat endpoint.
   * @param {string} question - The query string.
   * @returns {Promise<{answer: string, sources: string[]}>}
   */
  async sendMessage(question) {
    const response = await apiClient.post('/chat', { question });
    return response.data;
  },
};
