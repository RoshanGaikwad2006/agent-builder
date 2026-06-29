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
};
