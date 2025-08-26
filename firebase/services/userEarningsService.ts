import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment,
  Timestamp,
  writeBatch,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../config';
import { UserEarning } from '../types/ads';

// Collection name
const USER_EARNINGS_COLLECTION = 'userEarnings';

/**
 * Generate unique wallet address for user
 */
const generateWalletAddress = (userId: string): string => {
  // Generate a unique wallet address based on userId and timestamp
  const timestamp = Date.now().toString(36);
  const userPart = userId.slice(-8); // Last 8 chars of userId
  return `FOG${userPart}${timestamp}`.toUpperCase();
};

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
        totalAdsEarnings: data.totalAdsEarnings || 0,
        depositEarnings: data.depositEarnings || 0,
        referralEarnings: data.referralEarnings || 0,
        walletAddress: data.walletAddress || generateWalletAddress(userId),
        totalSent: data.totalSent || 0,
        totalReceived: data.totalReceived || 0,
        withdrawnAmount: data.withdrawnAmount || 0,
        lastUpdatedAt: data.lastUpdatedAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    } else {
      // Create new earnings record
      const walletAddress = generateWalletAddress(userId);
      const newEarnings: UserEarning = {
        id: userId,
        userId,
        totalEarnings: 0,
        availableBalance: 0,
        adsEarnings: 0,
        totalAdsEarnings: 0,
        depositEarnings: 0,
        referralEarnings: 0,
        walletAddress,
        totalSent: 0,
        totalReceived: 0,
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
      totalAdsEarnings: increment(amount), // ✅ Always increment the static total
      totalEarnings: increment(amount),
      availableBalance: increment(amount),
      lastUpdatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    // If document doesn't exist, create it first
    if (error.code === 'not-found') {
      await getUserEarnings(userId); // This will create the document
      // Retry the update
      const retryEarningsRef = doc(db, USER_EARNINGS_COLLECTION, userId);
      await updateDoc(retryEarningsRef, {
        adsEarnings: increment(amount),
        totalAdsEarnings: increment(amount), // ✅ Always increment the static total
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
  } catch (error: any) {
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
export const addDepositEarnings = async (userId: string, amount: number): Promise<void> => {
  try {
    const earningsRef = doc(db, USER_EARNINGS_COLLECTION, userId);
    
    await updateDoc(earningsRef, {
      depositEarnings: increment(amount),
      totalEarnings: increment(amount),
      availableBalance: increment(amount),
      lastUpdatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    // If document doesn't exist, create it first
    if (error.code === 'not-found') {
      await getUserEarnings(userId); // This will create the document
      // Retry the update
      const retryEarningsRef = doc(db, USER_EARNINGS_COLLECTION, userId);
      await updateDoc(retryEarningsRef, {
        depositEarnings: increment(amount),
        totalEarnings: increment(amount),
        availableBalance: increment(amount),
        lastUpdatedAt: Timestamp.now(),
      });
    } else {
      console.error('Error adding deposit earnings:', error);
      throw error;
    }
  }
};

/**
 * Transfer earnings to wallet (reduces available balance for withdrawal)
 * This function should be called by the earnings service when transferring to wallet
 */
export const transferEarningsToWallet = async (
  userId: string, 
  amount: number, 
  sourceType: 'ads' | 'deposits' | 'referrals'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const earningsRef = doc(db, USER_EARNINGS_COLLECTION, userId);
    
    // Check current balance first
    const currentEarnings = await getUserEarnings(userId);
    
    if (currentEarnings.availableBalance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }
    
    // Check source-specific balance
    let sourceBalance = 0;
    let sourceField = '';
    
    switch (sourceType) {
      case 'ads':
        sourceBalance = currentEarnings.adsEarnings;
        sourceField = 'adsEarnings';
        break;
      case 'deposits':
        sourceBalance = currentEarnings.depositEarnings;
        sourceField = 'depositEarnings';
        break;
      case 'referrals':
        sourceBalance = currentEarnings.referralEarnings;
        sourceField = 'referralEarnings';
        break;
      default:
        return { success: false, error: 'Invalid source type' };
    }
    
    if (sourceBalance < amount) {
      return { success: false, error: `Insufficient ${sourceType} balance` };
    }
    
    // Import the wallet service function
    const { addToWalletBalance } = await import('./walletService');
    
    // Use batch to ensure both operations succeed or fail together
    const batch = writeBatch(db);
    
    // Update earnings (reduce source balance and available balance)
    batch.update(earningsRef, {
      availableBalance: increment(-amount),
      [sourceField]: increment(-amount),
      lastUpdatedAt: Timestamp.now(),
    });
    
    await batch.commit();
    
    // Add to wallet balance
    await addToWalletBalance(userId, amount);

    return { success: true };
  } catch (error) {
    console.error('Error transferring earnings to wallet:', error);
    return { success: false, error: 'Transfer failed' };
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

/**
 * Transfer coins between users
 */
export const transferCoins = async (fromUserId: string, toWalletAddress: string, amount: number): Promise<{ success: boolean; error?: string }> => {
  try {
    // Find recipient by wallet address
    const recipientEarnings = await getUserByWalletAddress(toWalletAddress);
    if (!recipientEarnings) {
      return { success: false, error: 'Recipient wallet address not found' };
    }

    // Check sender's balance
    const senderEarnings = await getUserEarnings(fromUserId);
    if (senderEarnings.availableBalance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Perform transfer using batch
    const batch = writeBatch(db);
    
    const senderRef = doc(db, USER_EARNINGS_COLLECTION, fromUserId);
    const recipientRef = doc(db, USER_EARNINGS_COLLECTION, recipientEarnings.userId);

    // Update sender
    batch.update(senderRef, {
      availableBalance: increment(-amount),
      totalSent: increment(amount),
      lastUpdatedAt: Timestamp.now(),
    });

    // Update recipient
    batch.update(recipientRef, {
      availableBalance: increment(amount),
      totalReceived: increment(amount),
      depositEarnings: increment(amount),
      totalEarnings: increment(amount),
      lastUpdatedAt: Timestamp.now(),
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error transferring coins:', error);
    return { success: false, error: 'Transfer failed' };
  }
};

/**
 * Get user by wallet address
 */
export const getUserByWalletAddress = async (walletAddress: string): Promise<UserEarning | null> => {
  try {
    const earningsQuery = query(
      collection(db, USER_EARNINGS_COLLECTION),
      where('walletAddress', '==', walletAddress)
    );
    const snapshot = await getDocs(earningsQuery);
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      totalEarnings: data.totalEarnings || 0,
      availableBalance: data.availableBalance || 0,
      adsEarnings: data.adsEarnings || 0,
      totalAdsEarnings: data.totalAdsEarnings || 0,
      depositEarnings: data.depositEarnings || 0,
      referralEarnings: data.referralEarnings || 0,
      walletAddress: data.walletAddress,
      totalSent: data.totalSent || 0,
      totalReceived: data.totalReceived || 0,
      withdrawnAmount: data.withdrawnAmount || 0,
      lastUpdatedAt: data.lastUpdatedAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error getting user by wallet address:', error);
    return null;
  }
};
