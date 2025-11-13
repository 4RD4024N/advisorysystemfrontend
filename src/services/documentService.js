import api from './api';

/**
 * Document Service
 */
const documentService = {
  /**
   * Get my documents
   * @returns {Array} List of documents
   */
  getMyDocuments: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  /**
   * Create a new document
   * @param {Object} data - { title, tags }
   * @returns {Object} { id }
   */
  createDocument: async (data) => {
    const response = await api.post('/documents', data);
    return response.data;
  },

  /**
   * Upload a document version
   * @param {number} documentId - Document ID
   * @param {File} file - File to upload
   * @param {string} notes - Version notes
   * @returns {Object} { id, versionNo }
   */
  uploadVersion: async (documentId, file, notes = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('notes', notes);

    const response = await api.post(`/documents/${documentId}/versions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get document versions
   * @param {number} documentId - Document ID
   * @returns {Array} List of versions
   */
  getVersions: async (documentId) => {
    const response = await api.get(`/documents/${documentId}/versions`);
    return response.data;
  },

  /**
   * Download a file
   * @param {number} versionId - Version ID
   * @returns {Blob} File blob
   */
  downloadFile: async (versionId) => {
    const response = await api.get(`/documents/download/${versionId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Download file and trigger browser download
   * @param {number} versionId - Version ID
   * @param {string} fileName - File name
   */
  downloadAndSaveFile: async (versionId, fileName) => {
    const blob = await documentService.downloadFile(versionId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};

export default documentService;
