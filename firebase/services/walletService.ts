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
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../config';
import { 
  UserWallet, 
  WalletTransfer, 
  QRCodeData, 
  TransferRequest, 
  WalletBalance, 
  WalletStats 
} from '../types/wallet';
import { getUserProfile, updateUserProfile } from './userService';
import { getUserAdStats } from './adService';

// Collection names
const WALLETS_COLLECTION = 'userWallets';
const TRANSFERS_COLLECTION = 'walletTransfers';
const WALLET_BALANCES_COLLECTION = 'walletBalances';

/**
 * Generate a unique wallet address
 */
const generateWalletAddress = (): string => {
  const prefix = 'FOG';
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${prefix}${timestamp}${randomPart}`.toUpperCase();
};

/**
 * Create wallet for new user during registration
 */
export const createUserWallet = async (
  userId: string, 
  userName: string, 
  userEmail: string
): Promise<UserWallet> => {
  try {
    const walletAddress = generateWalletAddress();
    
    // Create QR code data
    const qrCodeData: QRCodeData = {
      walletAddress,
      userName,
      userEmail,
      userId,
      type: 'fogsly_wallet',
      version: '1.0'
    };

    const wallet: Omit<UserWallet, 'id'> = {
      userId,
      walletAddress,
      qrCodeData: JSON.stringify(qrCodeData),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const walletRef = await addDoc(collection(db, WALLETS_COLLECTION), wallet);
    
    // Initialize wallet balance
    await initializeWalletBalance(userId);
    
    return {
      id: walletRef.id,
      ...wallet
    };
  } catch (error) {
    console.error('Error creating user wallet:', error);
    throw error;
  }
};

/**
 * Get user's wallet
 */
export const getUserWallet = async (userId: string): Promise<UserWallet | null> => {
  try {
    const walletsQuery = query(
      collection(db, WALLETS_COLLECTION),
      where('userId', '==', userId),
      limit(1)
    );
    
    const snapshot = await getDocs(walletsQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as UserWallet;
  } catch (error) {
    console.error('Error getting user wallet:', error);
    throw error;
  }
};

/**
 * Get wallet by address
 */
export const getWalletByAddress = async (walletAddress: string): Promise<UserWallet | null> => {
  try {
    const walletsQuery = query(
      collection(db, WALLETS_COLLECTION),
      where('walletAddress', '==', walletAddress),
      limit(1)
    );
    
    const snapshot = await getDocs(walletsQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as UserWallet;
  } catch (error) {
    console.error('Error getting wallet by address:', error);
    throw error;
  }
};

/**
 * Initialize wallet balance for new user
 */
const initializeWalletBalance = async (userId: string): Promise<void> => {
  try {
    const balance: Omit<WalletBalance, 'userId'> = {
      totalBalance: 0,
      availableBalance: 0,
      pendingOutgoing: 0,
      pendingIncoming: 0,
      lastUpdated: new Date()
    };

    await setDoc(doc(db, WALLET_BALANCES_COLLECTION, userId), {
      userId,
      ...balance
    });
  } catch (error) {
    console.error('Error initializing wallet balance:', error);
    throw error;
  }
};

/**
 * Get user's wallet balance
 */
export const getWalletBalance = async (userId: string): Promise<WalletBalance | null> => {
  try {
    const balanceDoc = await getDoc(doc(db, WALLET_BALANCES_COLLECTION, userId));
    
    if (!balanceDoc.exists()) {
      // Initialize balance if it doesn't exist
      await initializeWalletBalance(userId);
      return await getWalletBalance(userId);
    }
    
    return balanceDoc.data() as WalletBalance;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    throw error;
  }
};

/**
 * Update wallet balance
 */
export const updateWalletBalance = async (userId: string): Promise<void> => {
  try {
    // Calculate pending transfers
    const pendingOutgoing = await calculatePendingOutgoing(userId);
    const pendingIncoming = await calculatePendingIncoming(userId);
    
    // Get current balance (which should already include deposits and transfers)
    const currentBalance = await getWalletBalance(userId);
    
    if (currentBalance) {
      // Update only pending amounts, keep total and available as they are
      // (they get updated by addToWalletBalance and transfer functions)
      const availableBalance = currentBalance.totalBalance - pendingOutgoing;
      
      const balance: WalletBalance = {
        userId,
        totalBalance: currentBalance.totalBalance,
        availableBalance: Math.max(0, availableBalance),
        pendingOutgoing,
        pendingIncoming,
        lastUpdated: new Date()
      };
      
      await setDoc(doc(db, WALLET_BALANCES_COLLECTION, userId), balance);
    }
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    throw error;
  }
};

/**
 * Add balance to wallet (used when transferring from earnings)
 */
export const addToWalletBalance = async (userId: string, amount: number): Promise<void> => {
  try {
    const balanceRef = doc(db, WALLET_BALANCES_COLLECTION, userId);
    const balanceDoc = await getDoc(balanceRef);
    
    if (!balanceDoc.exists()) {
      await initializeWalletBalance(userId);
    }
    
    await updateDoc(balanceRef, {
      totalBalance: increment(amount),
      availableBalance: increment(amount),
      lastUpdated: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding to wallet balance:', error);
    throw error;
  }
};

/**
 * Calculate pending outgoing transfers
 */
const calculatePendingOutgoing = async (userId: string): Promise<number> => {
  try {
    const transfersQuery = query(
      collection(db, TRANSFERS_COLLECTION),
      where('fromUserId', '==', userId),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(transfersQuery);
    let total = 0;
    
    snapshot.docs.forEach(doc => {
      const transfer = doc.data() as WalletTransfer;
      total += transfer.amount;
    });
    
    return total;
  } catch (error) {
    console.error('Error calculating pending outgoing:', error);
    return 0;
  }
};

/**
 * Calculate pending incoming transfers
 */
const calculatePendingIncoming = async (userId: string): Promise<number> => {
  try {
    const transfersQuery = query(
      collection(db, TRANSFERS_COLLECTION),
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(transfersQuery);
    let total = 0;
    
    snapshot.docs.forEach(doc => {
      const transfer = doc.data() as WalletTransfer;
      total += transfer.amount;
    });
    
    return total;
  } catch (error) {
    console.error('Error calculating pending incoming:', error);
    return 0;
  }
};

/**
 * Calculate completed sent transfers
 */
const calculateCompletedSent = async (userId: string): Promise<number> => {
  try {
    const transfersQuery = query(
      collection(db, TRANSFERS_COLLECTION),
      where('fromUserId', '==', userId),
      where('status', '==', 'completed')
    );
    
    const snapshot = await getDocs(transfersQuery);
    let total = 0;
    
    snapshot.docs.forEach(doc => {
      const transfer = doc.data() as WalletTransfer;
      total += transfer.amount;
    });
    
    return total;
  } catch (error) {
    console.error('Error calculating completed sent:', error);
    return 0;
  }
};

/**
 * Calculate completed received transfers
 */
const calculateCompletedReceived = async (userId: string): Promise<number> => {
  try {
    const transfersQuery = query(
      collection(db, TRANSFERS_COLLECTION),
      where('toUserId', '==', userId),
      where('status', '==', 'completed')
    );
    
    const snapshot = await getDocs(transfersQuery);
    let total = 0;
    
    snapshot.docs.forEach(doc => {
      const transfer = doc.data() as WalletTransfer;
      total += transfer.amount;
    });
    
    return total;
  } catch (error) {
    console.error('Error calculating completed received:', error);
    return 0;
  }
};

/**
 * Transfer FOG coins between users
 */
export const transferFogCoins = async (
  fromUserId: string, 
  transferRequest: TransferRequest
): Promise<{ success: boolean; transferId?: string; error?: string }> => {
  try {
    // Get sender's wallet and balance
    const senderWallet = await getUserWallet(fromUserId);
    if (!senderWallet) {
      return { success: false, error: 'Sender wallet not found' };
    }
    
    const senderBalance = await getWalletBalance(fromUserId);
    if (!senderBalance) {
      return { success: false, error: 'Sender balance not found' };
    }
    
    // Check if sender has sufficient balance
    if (senderBalance.availableBalance < transferRequest.amount) {
      return { 
        success: false, 
        error: `Insufficient balance. Available: ${senderBalance.availableBalance} FOG` 
      };
    }
    
    // Get recipient's wallet
    const recipientWallet = await getWalletByAddress(transferRequest.toWalletAddress);
    if (!recipientWallet) {
      return { success: false, error: 'Recipient wallet not found' };
    }
    
    // Check if not transferring to self
    if (recipientWallet.userId === fromUserId) {
      return { success: false, error: 'Cannot transfer to your own wallet' };
    }
    
    // Create transfer record
    const transfer: Omit<WalletTransfer, 'id'> = {
      fromUserId,
      toUserId: recipientWallet.userId,
      fromWalletAddress: senderWallet.walletAddress,
      toWalletAddress: transferRequest.toWalletAddress,
      amount: transferRequest.amount,
      status: 'pending',
      createdAt: new Date(),
      notes: transferRequest.notes
    };
    
    const transferRef = await addDoc(collection(db, TRANSFERS_COLLECTION), transfer);
    
    // Process transfer immediately (in a real app, this might be queued)
    await processTransfer(transferRef.id);
    
    return { success: true, transferId: transferRef.id };
  } catch (error) {
    console.error('Error transferring FOG coins:', error);
    return { success: false, error: 'Transfer failed. Please try again.' };
  }
};

/**
 * Process a pending transfer
 */
const processTransfer = async (transferId: string): Promise<void> => {
  try {
    const transferDoc = await getDoc(doc(db, TRANSFERS_COLLECTION, transferId));
    
    if (!transferDoc.exists()) {
      throw new Error('Transfer not found');
    }
    
    const transfer = transferDoc.data() as WalletTransfer;
    
    if (transfer.status !== 'pending') {
      return; // Already processed
    }
    
    // Generate transaction hash
    const transactionHash = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
    
    // Update transfer status
    await updateDoc(doc(db, TRANSFERS_COLLECTION, transferId), {
      status: 'completed',
      completedAt: new Date(),
      transactionHash
    });
    
    // Update both users' balances
    await updateWalletBalance(transfer.fromUserId);
    await updateWalletBalance(transfer.toUserId);
    
  } catch (error) {
    console.error('Error processing transfer:', error);
    
    // Mark transfer as failed
    await updateDoc(doc(db, TRANSFERS_COLLECTION, transferId), {
      status: 'failed',
      completedAt: new Date()
    });
    
    throw error;
  }
};

/**
 * Get user's transfer history
 */
export const getUserTransfers = async (
  userId: string, 
  limitCount: number = 20
): Promise<WalletTransfer[]> => {
  try {
    // Get both sent and received transfers
    const sentQuery = query(
      collection(db, TRANSFERS_COLLECTION),
      where('fromUserId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const receivedQuery = query(
      collection(db, TRANSFERS_COLLECTION),
      where('toUserId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery)
    ]);
    
    const transfers: WalletTransfer[] = [];
    
    sentSnapshot.docs.forEach(doc => {
      transfers.push({
        id: doc.id,
        ...doc.data()
      } as WalletTransfer);
    });
    
    receivedSnapshot.docs.forEach(doc => {
      transfers.push({
        id: doc.id,
        ...doc.data()
      } as WalletTransfer);
    });
    
    // Sort by creation date (newest first)
    transfers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return transfers.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting user transfers:', error);
    throw error;
  }
};

/**
 * Get wallet statistics
 */
export const getWalletStats = async (userId: string): Promise<WalletStats> => {
  try {
    const transfers = await getUserTransfers(userId, 1000); // Get more for accurate stats
    
    let totalSent = 0;
    let totalReceived = 0;
    let pendingTransfers = 0;
    
    transfers.forEach(transfer => {
      if (transfer.fromUserId === userId) {
        totalSent += transfer.amount;
        if (transfer.status === 'pending') {
          pendingTransfers++;
        }
      } else if (transfer.toUserId === userId) {
        totalReceived += transfer.amount;
        if (transfer.status === 'pending') {
          pendingTransfers++;
        }
      }
    });
    
    return {
      totalTransfers: transfers.length,
      totalSent,
      totalReceived,
      pendingTransfers
    };
  } catch (error) {
    console.error('Error getting wallet stats:', error);
    return {
      totalTransfers: 0,
      totalSent: 0,
      totalReceived: 0,
      pendingTransfers: 0
    };
  }
};

/**
 * Parse QR code data
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
