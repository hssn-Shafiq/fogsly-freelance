// File handling utilities for saving uploaded media to local storage

export interface SaveFileResult {
  success: boolean;
  filePath: string;
  error?: string;
}

export const saveFileToPublic = async (
  file: File, 
  directory: 'videos' | 'images', 
  adId: string
): Promise<SaveFileResult> => {
  try {
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `ad_${adId}_${directory === 'videos' ? 'video' : 'preview'}.${fileExtension}`;
    const relativePath = `/assets/ads/${directory}/${fileName}`;
    
    // Convert file to base64 for storage
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // In a real application, you would send this to a server endpoint
    // For development, we'll store in localStorage and provide instructions
    const fileData = {
      fileName,
      base64Data: base64,
      mimeType: file.type,
      size: file.size,
      relativePath
    };
    
    // Store file info in localStorage for development
    const storageKey = `adFile_${adId}_${directory}`;
    localStorage.setItem(storageKey, JSON.stringify(fileData));
    
    console.log(`File ${fileName} prepared for saving to public${relativePath}`);
    console.log('File data stored in localStorage with key:', storageKey);
    console.log('To complete the setup, manually copy the file to the public folder or implement server-side file handling');
    
    return {
      success: true,
      filePath: relativePath
    };
  } catch (error) {
    console.error('Error saving file:', error);
    return {
      success: false,
      filePath: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const getStoredFileData = (adId: string, type: 'videos' | 'images') => {
  const storageKey = `adFile_${adId}_${type}`;
  const stored = localStorage.getItem(storageKey);
  return stored ? JSON.parse(stored) : null;
};

export const downloadStoredFile = (adId: string, type: 'videos' | 'images') => {
  const fileData = getStoredFileData(adId, type);
  if (!fileData) {
    console.error('No file data found for', adId, type);
    return;
  }
  
  // Create downloadable blob
  const bytes = Uint8Array.from(atob(fileData.base64Data), c => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: fileData.mimeType });
  const url = URL.createObjectURL(blob);
  
  // Trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = fileData.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log(`Downloaded ${fileData.fileName}. Copy this file to public${fileData.relativePath}`);
};
