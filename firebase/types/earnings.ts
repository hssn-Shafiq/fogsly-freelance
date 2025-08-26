// Types for the earnings and wallet dashboard system

export interface EarningSource {
  id: string;
  name: string;
  type: 'ads' | 'referrals' | 'tasks' | 'bonuses' | 'other';
  icon: string;
  description: string;
  isActive: boolean;
}

export interface UserEarnings {
  userId: string;
  adEarnings: {
    totalEarned: number; // From ads watching
    availableBalance: number; // Available to transfer
    withdrawnAmount: number; // Already transferred to wallet
    lastEarningDate: Date;
  };
  referralEarnings: {
    totalEarned: number;
    availableBalance: number;
    withdrawnAmount: number;
    activeReferrals: number;
  };
  taskEarnings: {
    totalEarned: number;
    availableBalance: number;
    withdrawnAmount: number;
    completedTasks: number;
  };
  bonusEarnings: {
    totalEarned: number;
    availableBalance: number;
    withdrawnAmount: number;
    lastBonusDate: Date;
  };
  totalAvailableBalance: number; // Sum of all available balances
  totalLifetimeEarnings: number; // Sum of all total earned
  lastUpdated: Date;
}

export interface EarningToWalletTransfer {
  id: string;
  userId: string;
  sourceType: 'ads' | 'referrals' | 'tasks' | 'bonuses';
  amount: number; // FOG coins transferred
  fromBalance: number; // Balance before transfer
  toBalance: number; // Balance after transfer
  walletBalanceBefore: number;
  walletBalanceAfter: number;
  status: 'completed' | 'pending' | 'failed';
  transferredAt: Date;
  notes?: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'earning_transfer' | 'user_transfer' | 'withdrawal' | 'deposit';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
  relatedTransferId?: string; // For linking to earning transfers or user transfers
}

export interface DashboardStats {
  totalWalletBalance: number;
  totalAvailableEarnings: number;
  totalTransferred: number;
  totalWithdrawn: number;
  recentTransactions: WalletTransaction[];
  earningsSummary: {
    ads: { available: number; total: number };
    referrals: { available: number; total: number };
    tasks: { available: number; total: number };
    bonuses: { available: number; total: number };
  };
}
