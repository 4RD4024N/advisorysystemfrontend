import api from './api';

/**
 * Document Service
 */
const documentService = {
  /**
   * Get my documents
   * @returns {Array} List of documents
   * @note v3.1: Advisors will only see documents from their assigned students
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
   * @note v3.1: Advisors can only access their assigned students' documents (403 if not)
   */
  getVersions: async (documentId) => {
    const response = await api.get(`/documents/${documentId}/versions`);
    return response.data;
  },

  /**
   * Download a file
   * @param {number} versionId - Version ID
   * @returns {Blob} File blob
   * @note v3.1: Advisors can only download their assigned students' documents (403 if not)
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

  /**
   * Preview PDF file in browser
   * @param {number} versionId - Version ID
   * @returns {string} URL for PDF preview
   * @note v3.1: Advisors can only preview their assigned students' documents (403 if not)
   */
  getPreviewUrl: (versionId) => {
    const token = localStorage.getItem('token');
    const baseURL = api.defaults.baseURL || 'https://localhost:7175/api';
    return `${baseURL}/documents/preview/${versionId}?token=${token}`;
  },

  /**
   * Get file metadata
   * @param {number} versionId - Version ID
   * @returns {Object} File metadata
   */
  getMetadata: async (versionId) => {
    const response = await api.get(`/documents/metadata/${versionId}`);
    return response.data;
  },
};

export default documentService;
