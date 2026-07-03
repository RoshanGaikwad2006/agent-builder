import apiClient from './apiClient';

export const agentApi = {
  /**
   * Fetches all registered AI agents from MongoDB.
   * @returns {Promise<Array>}
   */
  async getAgents() {
    const response = await apiClient.get('/agents');
    return response.data;
  },

  /**
   * Fetches details of a single agent by database ID.
   * @param {string} id - Database ObjectId.
   * @returns {Promise<object>}
   */
  async getAgent(id) {
    const response = await apiClient.get(`/agents/${id}`);
    return response.data;
  },

  /**
   * Creates a new AI agent configuration.
   * @param {object} data - AgentCreate payload variables.
   * @returns {Promise<object>}
   */
  async createAgent(data) {
    const response = await apiClient.post('/agents', data);
    return response.data;
  },

  /**
   * Modifies an existing agent configuration in MongoDB.
   * @param {string} id - Database ObjectId.
   * @param {object} data - AgentUpdate payload variables.
   * @returns {Promise<object>}
   */
  async updateAgent(id, data) {
    const response = await apiClient.put(`/agents/${id}`, data);
    return response.data;
  },

  /**
   * Deletes an agent by database ID.
   * @param {string} id - Database ObjectId.
   * @returns {Promise<object>}
   */
  async deleteAgent(id) {
    const response = await apiClient.delete(`/agents/${id}`);
    return response.data;
  }
};
