import apiClient from './apiClient';

export const uploadApi = {
  /**
   * Uploads a PDF document to the FastAPI /upload endpoint with progress tracking.
   * @param {File} file - The file to upload.
   * @param {function(number): void} onProgress - Callback triggered on progress updates.
   * @returns {Promise<{filename: string, status: string, message: string}>}
   */
  async uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  /**
   * Fetches the metadata list of all ingested documents.
   * @returns {Promise<Array>}
   */
  async getDocuments() {
    const response = await apiClient.get('/documents');
    return response.data;
  },

  /**
   * Deletes a document by database ID.
   * @param {string} id - Database ObjectId.
   * @returns {Promise<object>}
   */
  async deleteDocument(id) {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  }
};
