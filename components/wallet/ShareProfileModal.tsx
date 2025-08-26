import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, QrCode, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { UserWallet, QRCodeData } from '../../firebase/types/wallet';
import { generateWalletQRCode, downloadQRCode, copyToClipboard, formatWalletAddress } from '../../utils/qrUtils';
import { toast } from 'react-hot-toast';

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: UserWallet;
  userName: string;
}

export default function ShareProfileModal({ 
  isOpen, 
  onClose, 
  wallet, 
  userName 
}: ShareProfileModalProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  useEffect(() => {
    if (isOpen && wallet) {
      generateQRCode();
    }
  }, [isOpen, wallet]);

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      const qrData: QRCodeData = JSON.parse(wallet.qrCodeData);
      const dataURL = await generateWalletQRCode(qrData);
      setQrCodeDataURL(dataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadQR = async () => {
    try {
      const qrData: QRCodeData = JSON.parse(wallet.qrCodeData);
      await downloadQRCode(qrData, `${userName.replace(/\s+/g, '-').toLowerCase()}-wallet-qr.png`);
      toast.success('QR code downloaded successfully!');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  const handleCopyAddress = async () => {
    const success = await copyToClipboard(wallet.walletAddress);
    if (success) {
      setCopiedAddress(true);
      toast.success('Wallet address copied to clipboard!');
      setTimeout(() => setCopiedAddress(false), 2000);
    } else {
      toast.error('Failed to copy wallet address');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Profile">
      <div className="max-w-md mx-auto">
        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
              {isLoading ? (
                <div className="w-64 h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--color-primary]"></div>
                </div>
              ) : qrCodeDataURL ? (
                <img 
                  src={qrCodeDataURL} 
                  alt="Wallet QR Code" 
                  className="w-44 h-44 object-contain"
                /> 
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-gray-500">
                  Failed to load QR code
                </div>
              )}
            </div>
          </div>

          {/* Wallet Address */}
          <div className="space-y-2">
            <h3 className="font-semibold text-[--color-text-primary]">Wallet Address</h3>
            <div className="flex items-center gap-2 p-3 bg-[--color-bg-secondary] rounded-lg border">
              <code className="flex-1 text-sm font-mono text-[--color-text-primary] break-all">
                {wallet.walletAddress}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyAddress}
                className="flex-shrink-0"
              >
                {copiedAddress ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-[--color-text-secondary]">
              Share this address with others to receive FOG coins
            </p>
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-[--color-text-primary]">Profile Information</h3>
            <div className="p-3 bg-[--color-bg-secondary] rounded-lg border space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[--color-text-secondary]">Name:</span>
                <span className="text-sm font-medium text-[--color-text-primary]">{userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[--color-text-secondary]">Address Preview:</span>
                <span className="text-sm font-mono text-[--color-text-primary]">
                  {formatWalletAddress(wallet.walletAddress)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleDownloadQR}
              className="flex-1 flex items-center gap-2"
              disabled={isLoading || !qrCodeDataURL}
            >
              <Download className="h-4 w-4" />
              Download QR
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyAddress}
              className="flex-1 flex items-center gap-2"
            >
              {copiedAddress ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Address
                </>
              )}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-center">
            <p className="text-xs text-[--color-text-secondary] leading-relaxed">
              Others can scan this QR code or use your wallet address to send you FOG coins. 
              Keep your wallet address safe and share it only with trusted parties.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
