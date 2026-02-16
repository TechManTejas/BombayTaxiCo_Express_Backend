/**
 * File upload and media processing utilities
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

export interface FileValidation {
  maxSize: number;
  allowedTypes: string[];
  allowedExtensions: string[];
}

export interface ProcessingOptions {
  resize?: { width: number; height: number };
  quality?: number;
  format?: string;
}

/**
 * Validates uploaded file
 */
export const validateUploadedFile = (
  file: Express.Multer.File,
  validation: FileValidation
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check file size
  if (file.size > validation.maxSize) {
    errors.push(`File size exceeds maximum allowed size of ${formatFileSize(validation.maxSize)}`);
  }
  
  // Check MIME type
  if (!validation.allowedTypes.includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} is not allowed`);
  }
  
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!validation.allowedExtensions.includes(ext)) {
    errors.push(`File extension ${ext} is not allowed`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formats file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes <= 0 || isNaN(bytes)) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generates unique filename
 */
export const generateUniqueFilename = (originalname: string): string => {
  const ext = path.extname(originalname);
  const name = path.basename(originalname, ext);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `${name}_${timestamp}_${random}${ext}`;
};

/**
 * Creates upload directory if it doesn't exist
 */
export const ensureUploadDirectory = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Removes file if it exists
 */
export const removeFile = (filePath: string): boolean => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error removing file:', error);
    return false;
  }
};

/**
 * Gets file information
 */
export const getFileInfo = (filePath: string): { size: number; mimeType: string; exists: boolean } => {
  try {
    if (!fs.existsSync(filePath)) {
      return { size: 0, mimeType: '', exists: false };
    }
    
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = getMimeTypeFromExtension(ext);
    
    return {
      size: stats.size,
      mimeType,
      exists: true
    };
  } catch (error) {
    return { size: 0, mimeType: '', exists: false };
  }
};

/**
 * Gets MIME type from file extension
 */
export const getMimeTypeFromExtension = (ext: string): string => {
  if (!ext) return 'application/octet-stream';
  const normalizedExt = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav'
  };
  
  return mimeTypes[normalizedExt] || 'application/octet-stream';
};

/**
 * Checks if file is an image
 */
export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

/**
 * Checks if file is a document
 */
export const isDocumentFile = (mimeType: string): boolean => {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/json',
    'application/xml'
  ];
  
  return documentTypes.includes(mimeType);
};

/**
 * Checks if file is a video
 */
export const isVideoFile = (mimeType: string): boolean => {
  return mimeType.startsWith('video/');
};

/**
 * Checks if file is an audio file
 */
export const isAudioFile = (mimeType: string): boolean => {
  return mimeType.startsWith('audio/');
};

/**
 * Creates multer storage configuration
 */
export const createMulterStorage = (destination: string): multer.StorageEngine => {
  ensureUploadDirectory(destination);
  
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      const uniqueName = generateUniqueFilename(file.originalname);
      cb(null, uniqueName);
    }
  });
};

/**
 * Creates multer file filter
 */
export const createFileFilter = (fileValidation: FileValidation) => {
  return (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const validationResult = validateUploadedFile(file, fileValidation);
    
    if (validationResult.isValid) {
      cb(null, true);
    } else {
      cb(new Error(validationResult.errors.join(', ')));
    }
  };
};

/**
 * Creates complete multer configuration
 */
export const createMulterConfig = (
  destination: string,
  validation: FileValidation
): multer.Options => {
  return {
    storage: createMulterStorage(destination),
    fileFilter: createFileFilter(validation),
    limits: {
      fileSize: validation.maxSize,
      files: 10 // Maximum 10 files per request
    }
  };
};

/**
 * Common file validation configurations
 */
export const fileValidations = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.txt']
  },
  
  profilePicture: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
  },
  
  vehicleImage: {
    maxSize: 8 * 1024 * 1024, // 8MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
  }
};

/**
 * File upload error types
 */
export enum UploadError {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  INVALID_FILE_EXTENSION = 'INVALID_FILE_EXTENSION',
  TOO_MANY_FILES = 'TOO_MANY_FILES',
  UPLOAD_FAILED = 'UPLOAD_FAILED'
}

/**
 * Creates standardized upload error response
 */
export const createUploadErrorResponse = (error: Error, file?: Express.Multer.File) => {
  if (error.message.includes('File too large')) {
    return {
      success: false,
      error: UploadError.FILE_TOO_LARGE,
      message: 'File size exceeds maximum allowed limit',
      file: file ? {
        name: file.originalname,
        size: file.size,
        type: file.mimetype
      } : undefined
    };
  }
  
  if (error.message.includes('File type') || error.message.includes('File extension')) {
    return {
      success: false,
      error: UploadError.INVALID_FILE_TYPE,
      message: 'Invalid file type or extension',
      file: file ? {
        name: file.originalname,
        type: file.mimetype
      } : undefined
    };
  }
  
  return {
    success: false,
    error: UploadError.UPLOAD_FAILED,
    message: 'File upload failed',
    details: error.message
  };
};

/**
 * Cleans up old files in upload directory
 */
export const cleanupOldFiles = (directory: string, maxAge: number = 24 * 60 * 60 * 1000): number => {
  try {
    if (!maxAge || maxAge <= 0 || isNaN(maxAge)) return 0;
    if (!fs.existsSync(directory)) {
      return 0;
    }
    
    const files = fs.readdirSync(directory);
    const now = Date.now();
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }
    
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up old files:', error);
    return 0;
  }
};

/**
 * Gets directory size
 */
export const getDirectorySize = (directory: string): number => {
  try {
    if (!fs.existsSync(directory)) {
      return 0;
    }
    
    let totalSize = 0;
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error getting directory size:', error);
    return 0;
  }
};
