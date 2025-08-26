import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config';

/**
 * Upload a file to Firebase Storage
 * @param file The file to upload
 * @param path The storage path where the file should be uploaded
 * @returns Promise that resolves to the download URL
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    // Create a reference to the file location
    const storageRef = ref(storage, path);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Upload multiple files to Firebase Storage
 * @param files Array of files with their paths
 * @returns Promise that resolves to an array of download URLs
 */
export const uploadMultipleFiles = async (
  files: { file: File; path: string }[]
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(({ file, path }) => uploadFile(file, path));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw new Error('Failed to upload files');
  }
};

/**
 * Generate a unique filename with timestamp
 * @param originalName The original filename
 * @param prefix Optional prefix for the filename
 * @returns A unique filename
 */
export const generateUniqueFilename = (originalName: string, prefix: string = ''): string => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
  
  return `${prefix}${prefix ? '_' : ''}${nameWithoutExtension}_${timestamp}.${extension}`;
};
