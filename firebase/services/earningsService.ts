import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  writeBatch 
} from 'firebase/firestore';
import { db } from '../config';
import { 
  UserEarnings, 
  EarningToWalletTransfer, 
  WalletTransaction, 
  DashboardStats 
} from '../types/earnings';
import { getUserAdStats } from './adService';
import { updateWalletBalance, getWalletBalance } from './walletService';
import { WalletBalance } from '../types/wallet';

// Collection names
const USER_EARNINGS_COLLECTION = 'userEarnings';
const EARNING_TRANSFERS_COLLECTION = 'earningToWalletTransfers';
const WALLET_TRANSACTIONS_COLLECTION = 'walletTransactions';

/**
 * Initialize user earnings when they first register
 */
export const initializeUserEarnings = async (userId: string): Promise<void> => {
  try {
    const userEarnings: Omit<UserEarnings, 'userId'> = {
      adEarnings: {
        totalEarned: 0,
        availableBalance: 0,
        withdrawnAmount: 0,
        lastEarningDate: new Date()
      },
      referralEarnings: {
        totalEarned: 0,
        availableBalance: 0,
        withdrawnAmount: 0,
        activeReferrals: 0
      },
      taskEarnings: {
        totalEarned: 0,
        availableBalance: 0,
        withdrawnAmount: 0,
        completedTasks: 0
      },
      bonusEarnings: {
        totalEarned: 0,
        availableBalance: 0,
        withdrawnAmount: 0,
        lastBonusDate: new Date()
      },
      totalAvailableBalance: 0,
      totalLifetimeEarnings: 0,
      lastUpdated: new Date()
    };

    await setDoc(doc(db, USER_EARNINGS_COLLECTION, userId), {
      userId,
      ...userEarnings
    });
  } catch (error) {
    console.error('Error initializing user earnings:', error);
    throw error;
  }
};

/**
 * Get user's comprehensive earnings data
 */
export const getUserEarnings = async (userId: string): Promise<UserEarnings | null> => {
  try {
    const earningsDoc = await getDoc(doc(db, USER_EARNINGS_COLLECTION, userId));
    
    if (!earningsDoc.exists()) {
      // Initialize if doesn't exist
      await initializeUserEarnings(userId);
      return await getUserEarnings(userId);
    }
    
    return earningsDoc.data() as UserEarnings;
  } catch (error) {
    console.error('Error getting user earnings:', error);
    throw error;
  }
};

/**
 * Update user earnings from ads
 */
export const updateAdEarnings = async (userId: string): Promise<void> => {
  try {
    // Get current ad stats
    const adStats = await getUserAdStats(userId);
    if (!adStats) return;

    // Get current earnings
    const earnings = await getUserEarnings(userId);
    if (!earnings) return;

    // Calculate available balance (total earned - already withdrawn)
    const availableBalance = Math.max(0, adStats.totalEarnings - earnings.adEarnings.withdrawnAmount);

    // Update ad earnings
    const updatedEarnings: UserEarnings = {
      ...earnings,
      adEarnings: {
        ...earnings.adEarnings,
        totalEarned: adStats.totalEarnings,
        availableBalance,
        lastEarningDate: new Date()
      },
      totalAvailableBalance: availableBalance + 
        earnings.referralEarnings.availableBalance + 
        earnings.taskEarnings.availableBalance + 
        earnings.bonusEarnings.availableBalance,
      totalLifetimeEarnings: adStats.totalEarnings + 
        earnings.referralEarnings.totalEarned + 
        earnings.taskEarnings.totalEarned + 
        earnings.bonusEarnings.totalEarned,
      lastUpdated: new Date()
    };

    await setDoc(doc(db, USER_EARNINGS_COLLECTION, userId), updatedEarnings);
  } catch (error) {
    console.error('Error updating ad earnings:', error);
    throw error;
  }
};

/**
 * Transfer earnings from source to wallet
 */
export const transferEarningsToWallet = async (
  userId: string, 
  sourceType: 'ads' | 'referrals' | 'tasks' | 'bonuses', 
  amount: number
): Promise<{ success: boolean; transferId?: string; error?: string }> => {
  try {
    // Get current earnings
    const earnings = await getUserEarnings(userId);
    if (!earnings) {
      return { success: false, error: 'User earnings not found' };
    }

    // Get source balance - properly access the nested object
    let sourceEarnings;
    switch (sourceType) {
      case 'ads':
        sourceEarnings = earnings.adEarnings;
        break;
      case 'referrals':
        sourceEarnings = earnings.referralEarnings;
        break;
      case 'tasks':
        sourceEarnings = earnings.taskEarnings;
        break;
      case 'bonuses':
        sourceEarnings = earnings.bonusEarnings;
        break;
      default:
        return { success: false, error: 'Invalid source type' };
    }

    if (!sourceEarnings || sourceEarnings.availableBalance < amount) {
      return { 
        success: false, 
        error: `Insufficient balance. Available: ${sourceEarnings?.availableBalance || 0} FOG` 
      };
    }

    // Get current wallet balance
    const walletBalance = await getWalletBalance(userId);
    const walletBalanceBefore = walletBalance?.totalBalance || 0;

    // Create transfer record
    const transfer: Omit<EarningToWalletTransfer, 'id'> = {
      userId,
      sourceType,
      amount,
      fromBalance: sourceEarnings.availableBalance,
      toBalance: sourceEarnings.availableBalance - amount,
      walletBalanceBefore,
      walletBalanceAfter: walletBalanceBefore + amount,
      status: 'pending',
      transferredAt: new Date()
    };

    const transferRef = await addDoc(collection(db, EARNING_TRANSFERS_COLLECTION), transfer);

    // Update earnings (reduce available balance, increase withdrawn amount)
    const updatedEarnings = { ...earnings };
    
    switch (sourceType) {
      case 'ads':
        updatedEarnings.adEarnings.availableBalance -= amount;
        updatedEarnings.adEarnings.withdrawnAmount += amount;
        break;
      case 'referrals':
        updatedEarnings.referralEarnings.availableBalance -= amount;
        updatedEarnings.referralEarnings.withdrawnAmount += amount;
        break;
      case 'tasks':
        updatedEarnings.taskEarnings.availableBalance -= amount;
        updatedEarnings.taskEarnings.withdrawnAmount += amount;
        break;
      case 'bonuses':
        updatedEarnings.bonusEarnings.availableBalance -= amount;
        updatedEarnings.bonusEarnings.withdrawnAmount += amount;
        break;
    }
    
    // Recalculate totals
    updatedEarnings.totalAvailableBalance = 
      updatedEarnings.adEarnings.availableBalance +
      updatedEarnings.referralEarnings.availableBalance +
      updatedEarnings.taskEarnings.availableBalance +
      updatedEarnings.bonusEarnings.availableBalance;
    
    updatedEarnings.lastUpdated = new Date();

    // Update earnings in database
    await setDoc(doc(db, USER_EARNINGS_COLLECTION, userId), updatedEarnings);

    // Update wallet balance (add the transferred amount directly)
    const currentWalletBalance = await getWalletBalance(userId);
    const newTotalBalance = (currentWalletBalance?.totalBalance || 0) + amount;
    const newAvailableBalance = (currentWalletBalance?.availableBalance || 0) + amount;
    
    const updatedWalletBalance: WalletBalance = {
      userId,
      totalBalance: newTotalBalance,
      availableBalance: newAvailableBalance,
      pendingOutgoing: currentWalletBalance?.pendingOutgoing || 0,
      pendingIncoming: currentWalletBalance?.pendingIncoming || 0,
      lastUpdated: new Date()
    };
    
    await setDoc(doc(db, 'walletBalances', userId), updatedWalletBalance);

    // Create wallet transaction record
    const walletTransaction: Omit<WalletTransaction, 'id'> = {
      userId,
      type: 'earning_transfer',
      amount,
      description: `Transfer from ${sourceType} earnings`,
      status: 'completed',
      createdAt: new Date(),
      relatedTransferId: transferRef.id
    };

    await addDoc(collection(db, WALLET_TRANSACTIONS_COLLECTION), walletTransaction);

    // Mark transfer as completed
    await updateDoc(doc(db, EARNING_TRANSFERS_COLLECTION, transferRef.id), {
      status: 'completed'
    });

    return { success: true, transferId: transferRef.id };
  } catch (error) {
    console.error('Error transferring earnings to wallet:', error);
    return { success: false, error: 'Transfer failed. Please try again.' };
  }
};

/**
 * Get user's dashboard statistics
 */
export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  try {
    // Get wallet balance
    const walletBalance = await getWalletBalance(userId);
    
    // Get earnings
    const earnings = await getUserEarnings(userId);
    
    // Get recent transactions
    const transactionsQuery = query(
      collection(db, WALLET_TRANSACTIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const transactionsSnapshot = await getDocs(transactionsQuery);
    const recentTransactions: WalletTransaction[] = [];
    
    transactionsSnapshot.docs.forEach(doc => {
      recentTransactions.push({
        id: doc.id,
        ...doc.data()
      } as WalletTransaction);
    });

    // Get total transferred amount
    const transfersQuery = query(
      collection(db, EARNING_TRANSFERS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'completed')
    );
    
    const transfersSnapshot = await getDocs(transfersQuery);
    let totalTransferred = 0;
    
    transfersSnapshot.docs.forEach(doc => {
      const transfer = doc.data() as EarningToWalletTransfer;
      totalTransferred += transfer.amount;
    });

    const stats: DashboardStats = {
      totalWalletBalance: walletBalance?.totalBalance || 0,
      totalAvailableEarnings: earnings?.totalAvailableBalance || 0,
      totalTransferred,
      totalWithdrawn: 0, // TODO: Implement withdrawal tracking
      recentTransactions,
      earningsSummary: {
        ads: {
          available: earnings?.adEarnings.availableBalance || 0,
          total: earnings?.adEarnings.totalEarned || 0
        },
        referrals: {
          available: earnings?.referralEarnings.availableBalance || 0,
          total: earnings?.referralEarnings.totalEarned || 0
        },
        tasks: {
          available: earnings?.taskEarnings.availableBalance || 0,
          total: earnings?.taskEarnings.totalEarned || 0
        },
        bonuses: {
          available: earnings?.bonusEarnings.availableBalance || 0,
          total: earnings?.bonusEarnings.totalEarned || 0
        }
      }
    };

    return stats;
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
};

/**
 * Get earning transfer history
 */
export const getEarningTransferHistory = async (
  userId: string, 
  limitCount: number = 20
): Promise<EarningToWalletTransfer[]> => {
  try {
    const transfersQuery = query(
      collection(db, EARNING_TRANSFERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('transferredAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(transfersQuery);
    const transfers: EarningToWalletTransfer[] = [];
    
    snapshot.docs.forEach(doc => {
      transfers.push({
        id: doc.id,
        ...doc.data()
      } as EarningToWalletTransfer);
    });
    
    return transfers;
  } catch (error) {
    console.error('Error getting earning transfer history:', error);
    throw error;
  }
};

/**
 * Sync all earning sources for a user
 */
export const syncAllEarnings = async (userId: string): Promise<void> => {
  try {
    // Update ad earnings from the ads system
    await updateAdEarnings(userId);
    
    // TODO: Add other earning sources (referrals, tasks, bonuses) when implemented
    
    console.log('All earnings synced successfully for user:', userId);
  } catch (error) {
    console.error('Error syncing all earnings:', error);
    throw error;
  }
};

/**
 * Add test earnings for development/testing purposes
 */
export const addTestEarnings = async (userId: string): Promise<void> => {
  try {
    const earnings = await getUserEarnings(userId);
    if (!earnings) return;

    const updatedEarnings: UserEarnings = {
      ...earnings,
      adEarnings: {
        ...earnings.adEarnings,
        totalEarned: 150.00,
        availableBalance: 75.50,
        lastEarningDate: new Date()
      },
      referralEarnings: {
        ...earnings.referralEarnings,
        totalEarned: 200.00,
        availableBalance: 125.25,
        activeReferrals: 5
      },
      taskEarnings: {
        ...earnings.taskEarnings,
        totalEarned: 89.75,
        availableBalance: 45.30,
        completedTasks: 12
      },
      bonusEarnings: {
        ...earnings.bonusEarnings,
        totalEarned: 50.00,
        availableBalance: 25.00,
        lastBonusDate: new Date()
      },
      totalAvailableBalance: 75.50 + 125.25 + 45.30 + 25.00,
      totalLifetimeEarnings: 150.00 + 200.00 + 89.75 + 50.00,
      lastUpdated: new Date()
    };

    await setDoc(doc(db, USER_EARNINGS_COLLECTION, userId), updatedEarnings);
    console.log('Test earnings added successfully for user:', userId);
  } catch (error) {
    console.error('Error adding test earnings:', error);
    throw error;
  }
};
