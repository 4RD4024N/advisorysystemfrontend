/**
 * File Validation Utilities
 * 
 * Validates file uploads according to system requirements:
 * - Max size: 10MB
 * - Allowed types: PDF, DOCX, PPTX only
 */

// Constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
export const MAX_FILE_SIZE_MB = 10;

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.pptx'];

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

export const FILE_TYPE_NAMES = {
  '.pdf': 'PDF',
  '.docx': 'Word Document (DOCX)',
  '.pptx': 'PowerPoint Presentation (PPTX)'
};

/**
 * Format bytes to human-readable size
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 * @param {string} filename - Name of the file
 * @returns {string} File extension in lowercase
 */
export const getFileExtension = (filename) => {
  return filename.substring(filename.lastIndexOf('.')).toLowerCase();
};

/**
 * Check if file extension is allowed
 * @param {string} filename - Name of the file
 * @returns {boolean} True if extension is allowed
 */
export const isAllowedExtension = (filename) => {
  const extension = getFileExtension(filename);
  return ALLOWED_EXTENSIONS.includes(extension);
};

/**
 * Check if file MIME type is allowed
 * @param {string} mimeType - MIME type of the file
 * @returns {boolean} True if MIME type is allowed
 */
export const isAllowedMimeType = (mimeType) => {
  return ALLOWED_MIME_TYPES.includes(mimeType);
};

/**
 * Check if file size is within limit
 * @param {number} size - File size in bytes
 * @returns {boolean} True if size is within limit
 */
export const isFileSizeValid = (size) => {
  return size <= MAX_FILE_SIZE;
};

/**
 * Validate file for upload
 * @param {File} file - File object to validate
 * @returns {{valid: boolean, error: string|null, details: object|null}}
 */
export const validateFile = (file) => {
  if (!file) {
    return {
      valid: false,
      error: 'Dosya seçilmedi',
      details: null
    };
  }

  // Check file size
  if (!isFileSizeValid(file.size)) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: `Dosya boyutu çok büyük (${sizeMB}MB). Maksimum dosya boyutu ${MAX_FILE_SIZE_MB}MB'dir.`,
      details: {
        type: 'size_exceeded',
        currentSize: file.size,
        currentSizeMB: parseFloat(sizeMB),
        maxSize: MAX_FILE_SIZE,
        maxSizeMB: MAX_FILE_SIZE_MB
      }
    };
  }

  // Check file extension
  const extension = getFileExtension(file.name);
  if (!isAllowedExtension(file.name)) {
    return {
      valid: false,
      error: `Dosya türü '${extension}' desteklenmiyor. Sadece PDF, DOCX ve PPTX dosyaları yüklenebilir.`,
      details: {
        type: 'invalid_extension',
        providedExtension: extension,
        allowedExtensions: ALLOWED_EXTENSIONS
      }
    };
  }

  // Check MIME type
  if (!isAllowedMimeType(file.type)) {
    return {
      valid: false,
      error: `Geçersiz dosya formatı. Sadece PDF, DOCX ve PPTX dosyaları kabul edilir.`,
      details: {
        type: 'invalid_mime_type',
        providedMimeType: file.type,
        allowedMimeTypes: ALLOWED_MIME_TYPES
      }
    };
  }

  // All validations passed
  return {
    valid: true,
    error: null,
    details: {
      fileName: file.name,
      fileSize: file.size,
      fileSizeFormatted: formatFileSize(file.size),
      mimeType: file.type,
      extension: extension
    }
  };
};

/**
 * Get file type icon based on extension
 * @param {string} filename - Name of the file
 * @returns {string} Emoji icon for file type
 */
export const getFileTypeIcon = (filename) => {
  const extension = getFileExtension(filename);
  const icons = {
    '.pdf': '📄',
    '.docx': 'DOC',
    '.pptx': 'PPT'
  };
  return icons[extension] || '📎';
};

/**
 * Check if file is a PDF (for preview capability)
 * @param {string} filename - Name of the file or MIME type
 * @returns {boolean} True if file is PDF
 */
export const isPdfFile = (filenameOrMimeType) => {
  if (filenameOrMimeType.includes('application/pdf')) {
    return true;
  }
  const extension = getFileExtension(filenameOrMimeType);
  return extension === '.pdf';
};

/**
 * Create file input accept attribute value
 * @returns {string} Accept attribute value for file input
 */
export const getFileInputAccept = () => {
  return ALLOWED_EXTENSIONS.join(',');
};

/**
 * Validate multiple files
 * @param {FileList|Array} files - List of files to validate
 * @returns {{valid: boolean, errors: Array, validFiles: Array, invalidFiles: Array}}
 */
export const validateMultipleFiles = (files) => {
  const fileArray = Array.from(files);
  const results = fileArray.map(file => ({
    file,
    validation: validateFile(file)
  }));

  const validFiles = results.filter(r => r.validation.valid).map(r => r.file);
  const invalidFiles = results.filter(r => !r.validation.valid);

  return {
    valid: invalidFiles.length === 0,
    errors: invalidFiles.map(r => ({
      fileName: r.file.name,
      error: r.validation.error,
      details: r.validation.details
    })),
    validFiles,
    invalidFiles: invalidFiles.map(r => r.file)
  };
};

export default {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  FILE_TYPE_NAMES,
  formatFileSize,
  getFileExtension,
  isAllowedExtension,
  isAllowedMimeType,
  isFileSizeValid,
  validateFile,
  getFileTypeIcon,
  isPdfFile,
  getFileInputAccept,
  validateMultipleFiles
};
