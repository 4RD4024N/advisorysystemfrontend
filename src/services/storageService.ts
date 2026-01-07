import api from './api';

/**
 * Storage Management Service
 * Handles all storage-related API calls (Admin only)
 */
const storageService = {
  /**
   * Get storage configuration info
   * @returns {Promise<Object>} Storage configuration
   */
  getInfo: async () => {
    const response = await api.get('/storage/info');
    return response.data;
  },

  /**
   * Get storage statistics
   * @returns {Promise<Object>} Storage statistics (total size, file count, etc.)
   */
  getStatistics: async () => {
    const response = await api.get('/storage/statistics');
    return response.data;
  },

  /**
   * List all files in storage
   * @returns {Promise<Array>} List of files
   */
  listFiles: async () => {
    const response = await api.get('/storage/files');
    return response.data;
  },

  /**
   * Check if file exists
   * @param {string} fileName - File name to check
   * @returns {Promise<Object>} { exists: boolean }
   */
  checkFileExists: async (fileName) => {
    const response = await api.get('/storage/exists', {
      params: { fileName }
    });
    return response.data;
  },

  /**
   * Clean up orphaned files (files without database records)
   * @returns {Promise<Object>} Cleanup results
   */
  cleanupOrphanedFiles: async () => {
    const response = await api.delete('/storage/cleanup-orphaned');
    return response.data;
  },

  /**
   * Get file metadata
   * @param {number} versionId - Document version ID
   * @returns {Promise<Object>} File metadata
   */
  getFileMetadata: async (versionId) => {
    const response = await api.get(`/storage/metadata/${versionId}`);
    return response.data;
  }
};

export default storageService;
