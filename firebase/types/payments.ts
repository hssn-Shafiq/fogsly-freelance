// Types for FOG Coin purchase payment system

export type Currency = 'USD' | 'PKR';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'processing';

export interface BankAccount {
  id: string;
  currency: Currency;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  iban?: string; // For PKR accounts
  branchName?: string; // For PKR accounts
  address?: string; // For crypto addresses
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  
  // Purchase details
  fogCoinsAmount: number; // How many FOG coins to purchase
  usdAmount: number; // USD equivalent
  localAmount: number; // Amount in selected currency (USD or PKR)
  currency: Currency;
  exchangeRate: number; // USD to PKR rate used
  fogToUsdRate: number; // FOG to USD rate used
  
  // Payment details
  selectedBankAccountId: string;
  transactionId?: string;
  accountName?: string;
  accountNumber?: string;
  paymentScreenshot?: string; // Firebase Storage URL
  
  // Status and timestamps
  status: PaymentStatus;
  submittedAt: Date;
  processedAt?: Date;
  processedBy?: string; // Admin user ID
  adminNotes?: string;
  
  // User submitted verification details
  verificationDetails?: {
    transactionId: string;
    accountName: string;
    accountNumber: string;
    paymentScreenshot: string;
    submittedAt: Date;
  };
}

export interface PaymentRequestFormData {
  transactionId: string;
  accountName: string;
  accountNumber: string;
  paymentScreenshot: File;
}

// Admin panel interfaces
export interface AdminPaymentDashboard {
  totalPendingRequests: number;
  totalApprovedRequests: number;
  totalRejectedRequests: number;
  totalAmountProcessed: number;
  recentRequests: PaymentRequest[];
}
