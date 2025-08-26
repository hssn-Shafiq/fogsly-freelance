import React, { useState, useRef } from 'react';
import { Send, Upload, Check, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Card, CardContent } from '../ui/Card';
import { WalletBalance, TransferRequest } from '../../firebase/types/wallet';
import { transferFogCoins, getWalletByAddress } from '../../firebase/services/walletService';
import { parseQRCodeData, isValidWalletAddress } from '../../utils/qrUtils';
import { toast } from 'react-hot-toast';

interface TransferCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  balance: WalletBalance;
  onTransferComplete: () => void;
}

type TransferMethod = 'address' | 'qr-upload';

export default function TransferCoinsModal({ 
  isOpen, 
  onClose, 
  currentUserId, 
  balance, 
  onTransferComplete 
}: TransferCoinsModalProps) {
  const [transferMethod, setTransferMethod] = useState<TransferMethod>('address');
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState<{name: string; email: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setWalletAddress('');
    setAmount('');
    setNotes('');
    setRecipientInfo(null);
    setTransferMethod('address');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    if (!walletAddress.trim()) {
      toast.error('Please enter a wallet address');
      return false;
    }

    if (!isValidWalletAddress(walletAddress)) {
      toast.error('Invalid wallet address format');
      return false;
    }

    const transferAmount = parseFloat(amount);
    if (!transferAmount || transferAmount <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }

    if (transferAmount > balance.availableBalance) {
      toast.error(`Insufficient balance. Available: ${balance.availableBalance} FOG`);
      return false;
    }

    return true;
  };

  const loadRecipientInfo = async (address: string) => {
    try {
      const wallet = await getWalletByAddress(address);
      if (wallet) {
        const qrData = JSON.parse(wallet.qrCodeData);
        setRecipientInfo({
          name: qrData.userName,
          email: qrData.userEmail
        });
      }
    } catch (error) {
      console.error('Error loading recipient info:', error);
    }
  };

  const handleAddressChange = (address: string) => {
    setWalletAddress(address);
    setRecipientInfo(null);
    
    if (isValidWalletAddress(address)) {
      loadRecipientInfo(address);
    }
  };

  const handleQRUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For now, we'll prompt user to manually enter the wallet address
    // In a production app, you would use a QR code reading library
    toast('Please manually enter the wallet address from the QR code', {
      icon: 'ℹ️',
    });
  };

  const handleTransfer = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const transferRequest: TransferRequest = {
        toWalletAddress: walletAddress,
        amount: parseFloat(amount),
        notes: notes.trim() || '' // Use empty string instead of undefined
      };

      const result = await transferFogCoins(currentUserId, transferRequest);
      
      if (result.success) {
        toast.success(`Successfully transferred ${amount} FOG coins!`);
        onTransferComplete();
        handleClose();
      } else {
        toast.error(result.error || 'Transfer failed');
      }
    } catch (error) {
      console.error('Error transferring coins:', error);
      toast.error('Transfer failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Transfer FOG Coins">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Balance Display */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-[--color-text-secondary]">Available Balance</p>
              <p className="text-2xl font-bold text-[--color-primary]">
                {balance.availableBalance.toFixed(2)} FOG
              </p>
              <p className="text-xs text-[--color-text-secondary]">
                ≈ ${(balance.availableBalance * 0.10).toFixed(2)} USD
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transfer Method Selection */}
        <div className="space-y-3">
          <Label>Transfer Method</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={transferMethod === 'address' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTransferMethod('address')}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Send className="h-4 w-4" />
              <span className="text-xs">Address</span>
            </Button>
            <Button
              variant={transferMethod === 'qr-upload' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTransferMethod('qr-upload')}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Upload className="h-4 w-4" />
              <span className="text-xs">Upload QR</span>
            </Button>
          </div>
        </div>

        {/* Transfer Method Content */}
        {transferMethod === 'address' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="walletAddress">Recipient Wallet Address</Label>
              <Input
                id="walletAddress"
                placeholder="FOG1234567890ABCDEF"
                value={walletAddress}
                onChange={(e) => handleAddressChange(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
        )}

        {transferMethod === 'qr-upload' && (
          <div className="space-y-4">
            <div className="text-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload QR Code Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleQRUpload}
                className="hidden"
              />
              <p className="text-xs text-[--color-text-secondary] mt-2">
                For now, please manually enter the wallet address below
              </p>
            </div>
          </div>
        )}

        {/* Recipient Info */}
        {recipientInfo && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-[--color-text-primary]">Recipient Found</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-[--color-text-primary]">
                  {recipientInfo.name}
                </p>
                <p className="text-xs text-[--color-text-secondary]">
                  {recipientInfo.email}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (FOG Coins)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            max={balance.availableBalance}
            step="0.01"
          />
          <div className="flex justify-between text-xs text-[--color-text-secondary]">
            <span>Min: 0.01 FOG</span>
            <span>Max: {balance.availableBalance} FOG</span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add a note for this transfer..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={200}
            rows={3}
          />
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-800">
            <p className="font-semibold">Important:</p>
            <p>Transfers are final and cannot be reversed. Please verify the recipient's wallet address carefully.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            className="flex-1"
            disabled={isLoading || !walletAddress || !amount}
          >
            {isLoading ? 'Processing...' : `Transfer ${amount || '0'} FOG`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
