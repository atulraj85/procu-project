interface UploadResponse {
  message: string;
  url: string;
  key: string;
  fileName: string;
  size: number; // File size in bytes
  fileType: 'image' | 'document'; // Add file type indicator
  compressed?: boolean; // For images and some documents
  compressionRatio?: string; // Compression info
}

// Define file type categories
const IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff'
];

const DOCUMENT_TYPES = [
  // PDF
  'application/pdf',
  
  // Microsoft Word
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  
  // Microsoft Excel
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  
  // Microsoft PowerPoint
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  
  // Text files
  'text/plain',
  'text/csv',
  
  // Other formats
  'application/rtf',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  
  // Archives
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.rar',
  'application/x-7z-compressed'
];

/**
 * Determines the file type category and appropriate upload endpoint
 */
const getFileTypeAndEndpoint = (file: File): { fileType: 'image' | 'document', endpoint: string } => {
  const mimeType = file.type.toLowerCase();
  
  if (IMAGE_TYPES.includes(mimeType)) {
    return { fileType: 'image', endpoint: '/api/aws-upload' };
  }
  
  if (DOCUMENT_TYPES.includes(mimeType)) {
    return { fileType: 'document', endpoint: '/api/aws-upload/document' };
  }
  
  // Default to document endpoint for unknown types
  console.warn(`Unknown file type: ${mimeType}. Defaulting to document upload.`);
  return { fileType: 'document', endpoint: '/api/aws-upload/document' };
};

/**
 * Uploads a file to the appropriate AWS S3 endpoint based on file type
 * Images go to /api/aws-upload (with compression)
 * Documents go to /api/aws-upload/document (with optional compression)
 */
const uploadFile = async (
  fileToUpload: File, 
  organizationName?: string,
  options?: {
    compress?: boolean; // For documents, defaults to true
  }
): Promise<UploadResponse> => {
  
  // Validate file
  if (!fileToUpload) {
    throw new Error('No file provided');
  }
  
  if (fileToUpload.size === 0) {
    throw new Error('File is empty');
  }
  
  // Determine file type and endpoint
  const { fileType, endpoint } = getFileTypeAndEndpoint(fileToUpload);
  
  console.log(`📁 Uploading ${fileType}: ${fileToUpload.name} (${Math.round(fileToUpload.size / 1024)}KB) to ${endpoint}`);
  
  // Prepare form data
  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('organizationName', organizationName ?? "DefaultOrg");
  
  // Add compression option for documents
  if (fileType === 'document' && options?.compress !== undefined) {
    formData.append('compress', options.compress.toString());
  }
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (response.ok && result.url) {
      // Standardize response format from both endpoints
      const standardResponse: UploadResponse = {
        message: result.message,
        url: result.url,
        key: result.key,
        fileName: result.fileName || result.fileInfo?.fileName,
        size: fileToUpload.size,
        fileType: fileType,
      };
      
      // Add compression info if available
      if (fileType === 'image' && result.optimization) {
        standardResponse.compressed = !result.optimization.compressionSkipped;
        standardResponse.compressionRatio = result.optimization.compressionRatio;
      } else if (fileType === 'document' && result.fileInfo) {
        standardResponse.compressed = result.fileInfo.compressed;
        standardResponse.compressionRatio = result.fileInfo.compressionRatio;
      }
      
      console.log(`✅ ${fileType} uploaded successfully: ${result.url}`);
      return standardResponse;
      
    } else {
      throw new Error(result.error || result.details || 'Upload failed');
    }
    
  } catch (error) {
    console.error(`❌ Upload failed:`, error);
    
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    } else {
      throw new Error('Upload failed: Unknown error');
    }
  }
};

/**
 * Helper function to check if a file is an image
 */
export const isImageFile = (file: File): boolean => {
  return IMAGE_TYPES.includes(file.type.toLowerCase());
};

/**
 * Helper function to check if a file is a document
 */
export const isDocumentFile = (file: File): boolean => {
  return DOCUMENT_TYPES.includes(file.type.toLowerCase());
};

/**
 * Helper function to get file type category
 */
export const getFileCategory = (file: File): 'image' | 'document' | 'unknown' => {
  const mimeType = file.type.toLowerCase();
  
  if (IMAGE_TYPES.includes(mimeType)) return 'image';
  if (DOCUMENT_TYPES.includes(mimeType)) return 'document';
  return 'unknown';
};

/**
 * Helper function to format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Batch upload multiple files
 */
export const uploadMultipleFiles = async (
  files: File[],
  organizationName?: string,
  options?: {
    compress?: boolean;
    onProgress?: (progress: { completed: number; total: number; currentFile: string }) => void;
  }
): Promise<UploadResponse[]> => {
  const results: UploadResponse[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Call progress callback
    options?.onProgress?.({
      completed: i,
      total: files.length,
      currentFile: file.name
    });
    
    try {
      const result = await uploadFile(file, organizationName, { compress: options?.compress });
      results.push(result);
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      // Continue with other files, but you might want to collect errors
      throw error; // Or handle gracefully based on your needs
    }
  }
  
  // Final progress callback
  options?.onProgress?.({
    completed: files.length,
    total: files.length,
    currentFile: ''
  });
  
  return results;
};

export default uploadFile;
