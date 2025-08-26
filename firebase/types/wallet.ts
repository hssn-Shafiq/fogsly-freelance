// Types for the wallet system

export interface UserWallet {
  id: string;
  userId: string;
  walletAddress: string;
  qrCodeData: string; // JSON string containing user info for QR
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransfer {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromWalletAddress: string;
  toWalletAddress: string;
  amount: number; // FOG coins
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionHash?: string;
  createdAt: Date;
  completedAt?: Date;
  notes?: string;
}

export interface QRCodeData {
  walletAddress: string;
  userName: string;
  userEmail: string;
  userId: string;
  type: 'fogsly_wallet';
  version: '1.0';
}

export interface TransferRequest {
  toWalletAddress: string;
  amount: number;
  notes: string; // Required string field, use empty string if no notes
}

export interface WalletBalance {
  userId: string;
  totalBalance: number; // Total FOG coins
  availableBalance: number; // Available for transfer (total - pending transfers)
  pendingOutgoing: number; // Pending outgoing transfers
  pendingIncoming: number; // Pending incoming transfers
  lastUpdated: Date;
}

export interface WalletStats {
  totalTransfers: number;
  totalSent: number;
  totalReceived: number;
  pendingTransfers: number;
}
