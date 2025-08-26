import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { UserEarning } from '../types/ads';

// Collection name
const USER_EARNINGS_COLLECTION = 'userEarnings';

/**
 * Get or create user earnings record
 */
export const getUserEarnings = async (userId: string): Promise<UserEarning> => {
  try {
    const earningsRef = doc(db, USER_EARNINGS_COLLECTION, userId);
    const earningsSnap = await getDoc(earningsRef);

    if (earningsSnap.exists()) {
      const data = earningsSnap.data();
      return {
        id: earningsSnap.id,
        userId: data.userId,
        totalEarnings: data.totalEarnings || 0,
        availableBalance: data.availableBalance || 0,
        adsEarnings: data.adsEarnings || 0,
        transferEarnings: data.transferEarnings || 0,
        referralEarnings: data.referralEarnings || 0,
        withdrawnAmount: data.withdrawnAmount || 0,
        lastUpdatedAt: data.lastUpdatedAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    } else {
      // Create new earnings record
      const newEarnings: UserEarning = {
        id: userId,
        userId,
        totalEarnings: 0,
        availableBalance: 0,
        adsEarnings: 0,
        transferEarnings: 0,
        referralEarnings: 0,
        withdrawnAmount: 0,
        lastUpdatedAt: new Date(),
        createdAt: new Date(),
      };

      await setDoc(earningsRef, {
        ...newEarnings,
        lastUpdatedAt: Timestamp.fromDate(newEarnings.lastUpdatedAt),
        createdAt: Timestamp.fromDate(newEarnings.createdAt),
      });

      return newEarnings;
    }
  } catch (error) {
    console.error('Error getting user earnings:', error);
    throw error;
  }
};

/**
 * Add earnings from watching ads
 */
export const addAdsEarnings = async (userId: string, amount: number): Promise<void> => {
  try {
    const earningsRef = doc(db, USER_EARNINGS_COLLECTION, userId);
    
    await updateDoc(earningsRef, {
      adsEarnings: increment(amount),
      totalEarnings: increment(amount),
      availableBalance: increment(amount),
      lastUpdatedAt: Timestamp.now(),
    });
  } catch (error) {
    // If document doesn't exist, create it first
    if (error.code === 'not-found') {
      await getUserEarnings(userId); // This will create the document
      // Retry the update
      const retryEarningsRef = doc(db, USER_EARNINGS_COLLECTION, userId);
      await updateDoc(retryEarningsRef, {
        adsEarnings: increment(amount),
        totalEarnings: increment(amount),
        availableBalance: increment(amount),
        lastUpdatedAt: Timestamp.now(),
      });
    } else {
      console.error('Error adding ads earnings:', error);
      throw error;
    }
  }
};

/**
 * Add earnings from referrals
 */
export const addReferralEarnings = async (userId: string, amount: number): Promise<void> => {
  try {
    const earningsRef = doc(db, USER_EARNINGS_COLLECTION, userId);
    
    await updateDoc(earningsRef, {
      referralEarnings: increment(amount),
      totalEarnings: increment(amount),
      availableBalance: increment(amount),
      lastUpdatedAt: Timestamp.now(),
    });
  } catch (error) {
    // If document doesn't exist, create it first
    if (error.code === 'not-found') {
      await getUserEarnings(userId); // This will create the document
      // Retry the update
      const retryEarningsRef = doc(db, USER_EARNINGS_COLLECTION, userId);
      await updateDoc(retryEarningsRef, {
        referralEarnings: increment(amount),
        totalEarnings: increment(amount),
        availableBalance: increment(amount),
        lastUpdatedAt: Timestamp.now(),
      });
    } else {
      console.error('Error adding referral earnings:', error);
      throw error;
    }
  }
};

/**
 * Add earnings from transfers (when receiving coins from other users)
 */
export const addTransferEarnings = async (userId: string, amount: number): Promise<void> => {
  try {
    const earningsRef = doc(db, USER_EARNINGS_COLLECTION, userId);
    
    await updateDoc(earningsRef, {
      transferEarnings: increment(amount),
      totalEarnings: increment(amount),
      availableBalance: increment(amount),
      lastUpdatedAt: Timestamp.now(),
    });
  } catch (error) {
    // If document doesn't exist, create it first
    if (error.code === 'not-found') {
      await getUserEarnings(userId); // This will create the document
      // Retry the update
      const retryEarningsRef = doc(db, USER_EARNINGS_COLLECTION, userId);
      await updateDoc(retryEarningsRef, {
        transferEarnings: increment(amount),
        totalEarnings: increment(amount),
        availableBalance: increment(amount),
        lastUpdatedAt: Timestamp.now(),
      });
    } else {
      console.error('Error adding transfer earnings:', error);
      throw error;
    }
  }
};

/**
 * Transfer earnings to wallet (reduces available balance for withdrawal)
 * This function should be called by the earnings service when transferring to wallet
 */
export const transferEarningsToWallet = async (userId: string, amount: number): Promise<void> => {
  try {
    const earningsRef = doc(db, USER_EARNINGS_COLLECTION, userId);
    
    // Check current balance first
    const currentEarnings = await getUserEarnings(userId);
    
    if (currentEarnings.availableBalance < amount) {
      throw new Error('Insufficient balance');
    }
    
    await updateDoc(earningsRef, {
      availableBalance: increment(-amount),
      withdrawnAmount: increment(amount),
      lastUpdatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error transferring earnings to wallet:', error);
    throw error;
  }
};

/**
 * Get user's current available balance
 */
export const getUserAvailableBalance = async (userId: string): Promise<number> => {
  try {
    const earnings = await getUserEarnings(userId);
    return earnings.availableBalance;
  } catch (error) {
    console.error('Error getting user available balance:', error);
    return 0;
  }
};

/**
 * Initialize user earnings (called when user first registers)
 */
export const initializeUserEarnings = async (userId: string): Promise<UserEarning> => {
  return getUserEarnings(userId); // This will create the record if it doesn't exist
};
