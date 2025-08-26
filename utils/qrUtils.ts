import QRCode from 'qrcode';
import { QRCodeData } from '../firebase/types/wallet';

/**
 * Generate QR code as data URL for wallet sharing
 */
export const generateWalletQRCode = async (qrCodeData: QRCodeData): Promise<string> => {
  try {
    const dataString = JSON.stringify(qrCodeData);
    
    const qrCodeDataURL = await QRCode.toDataURL(dataString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate QR code as canvas element for download
 */
export const generateQRCodeCanvas = async (qrCodeData: QRCodeData): Promise<HTMLCanvasElement> => {
  try {
    const dataString = JSON.stringify(qrCodeData);
    const canvas = document.createElement('canvas');
    
    await QRCode.toCanvas(canvas, dataString, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    
    return canvas;
  } catch (error) {
    console.error('Error generating QR code canvas:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Download QR code as PNG image
 */
export const downloadQRCode = async (qrCodeData: QRCodeData, filename: string = 'fogsly-wallet-qr.png'): Promise<void> => {
  try {
    const canvas = await generateQRCodeCanvas(qrCodeData);
    
    // Create download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw new Error('Failed to download QR code');
  }
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * Format wallet address for display (truncate middle)
 */
export const formatWalletAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Parse QR code data (placeholder for future implementation)
 */
export const parseQRCodeData = (qrData: string): QRCodeData | null => {
  try {
    const parsed = JSON.parse(qrData);
    
    if (parsed.type === 'fogsly_wallet' && parsed.walletAddress) {
      return parsed as QRCodeData;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing QR code data:', error);
    return null;
  }
};

/**
 * Validate wallet address format
 */
export const isValidWalletAddress = (address: string): boolean => {
  // FOGSLY wallet addresses start with 'FOG' and have specific length
  const regex = /^FOG[A-Z0-9]{12,20}$/;
  return regex.test(address);
};
