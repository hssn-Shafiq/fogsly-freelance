import { 
  collection, 
  doc, 
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config';
import { 
  PaymentRequest, 
  PaymentRequestFormData, 
  BankAccount, 
  Currency,
  PaymentStatus 
} from '../types/payments';
import { addToWalletBalance } from './walletService';
import { addDepositEarnings } from './userEarningsService';

// Collection names
const PAYMENT_REQUESTS_COLLECTION = 'paymentRequests';
const BANK_ACCOUNTS_COLLECTION = 'bankAccounts';

// USD to PKR exchange rate (can be made dynamic later)
const USD_TO_PKR_RATE = 284.67;

/**
 * Get bank accounts by currency
 */
export const getBankAccountsByCurrency = async (currency: Currency): Promise<BankAccount[]> => {
  try {
    const accountsQuery = query(
      collection(db, BANK_ACCOUNTS_COLLECTION),
      where('currency', '==', currency),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(accountsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
    })) as BankAccount[];
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return [];
  }
};

/**
 * Create a new payment request
 */
export const createPaymentRequest = async (
  userId: string,
  userEmail: string,
  userName: string,
  fogCoinsAmount: number,
  usdAmount: number,
  currency: Currency,
  fogToUsdRate: number,
  selectedBankAccountId: string
): Promise<string> => {
  try {
    const localAmount = currency === 'USD' ? usdAmount : usdAmount * USD_TO_PKR_RATE;
    
    const paymentRequest: Omit<PaymentRequest, 'id'> = {
      userId,
      userEmail,
      userName,
      fogCoinsAmount,
      usdAmount,
      localAmount,
      currency,
      exchangeRate: USD_TO_PKR_RATE,
      fogToUsdRate,
      selectedBankAccountId,
      status: 'pending',
      submittedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, PAYMENT_REQUESTS_COLLECTION), {
      ...paymentRequest,
      submittedAt: Timestamp.fromDate(paymentRequest.submittedAt),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating payment request:', error);
    throw error;
  }
};

/**
 * Submit payment verification details
 */
export const submitPaymentVerification = async (
  paymentRequestId: string,
  verificationData: PaymentRequestFormData,
  screenshotUrl: string
): Promise<void> => {
  try {
    const paymentRef = doc(db, PAYMENT_REQUESTS_COLLECTION, paymentRequestId);
    
    await updateDoc(paymentRef, {
      'verificationDetails.transactionId': verificationData.transactionId,
      'verificationDetails.accountName': verificationData.accountName,
      'verificationDetails.accountNumber': verificationData.accountNumber,
      'verificationDetails.paymentScreenshot': screenshotUrl,
      'verificationDetails.submittedAt': Timestamp.now(),
      status: 'processing'
    });
  } catch (error) {
    console.error('Error submitting payment verification:', error);
    throw error;
  }
};

/**
 * Get payment request by ID
 */
export const getPaymentRequest = async (paymentRequestId: string): Promise<PaymentRequest | null> => {
  try {
    const paymentRef = doc(db, PAYMENT_REQUESTS_COLLECTION, paymentRequestId);
    const paymentDoc = await getDoc(paymentRef);
    
    if (!paymentDoc.exists()) {
      return null;
    }
    
    const data = paymentDoc.data();
    return {
      id: paymentDoc.id,
      ...data,
      submittedAt: data.submittedAt?.toDate?.() || new Date(data.submittedAt),
      processedAt: data.processedAt?.toDate?.() || (data.processedAt ? new Date(data.processedAt) : undefined),
      verificationDetails: data.verificationDetails ? {
        ...data.verificationDetails,
        submittedAt: data.verificationDetails.submittedAt?.toDate?.() || new Date(data.verificationDetails.submittedAt),
      } : undefined,
    } as PaymentRequest;
  } catch (error) {
    console.error('Error fetching payment request:', error);
    return null;
  }
};

/**
 * Get user's payment requests
 */
export const getUserPaymentRequests = async (userId: string): Promise<PaymentRequest[]> => {
  try {
    const requestsQuery = query(
      collection(db, PAYMENT_REQUESTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc')
    );
    
    const snapshot = await getDocs(requestsQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate?.() || new Date(data.submittedAt),
        processedAt: data.processedAt?.toDate?.() || (data.processedAt ? new Date(data.processedAt) : undefined),
        verificationDetails: data.verificationDetails ? {
          ...data.verificationDetails,
          submittedAt: data.verificationDetails.submittedAt?.toDate?.() || new Date(data.verificationDetails.submittedAt),
        } : undefined,
      } as PaymentRequest;
    });
  } catch (error) {
    console.error('Error fetching user payment requests:', error);
    return [];
  }
};

/**
 * Admin: Get all payment requests with optional status filter
 */
export const getAllPaymentRequests = async (status?: PaymentStatus): Promise<PaymentRequest[]> => {
  try {
    let requestsQuery = query(
      collection(db, PAYMENT_REQUESTS_COLLECTION),
      orderBy('submittedAt', 'desc')
    );
    
    if (status) {
      requestsQuery = query(
        collection(db, PAYMENT_REQUESTS_COLLECTION),
        where('status', '==', status),
        orderBy('submittedAt', 'desc')
      );
    }
    
    const snapshot = await getDocs(requestsQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate?.() || new Date(data.submittedAt),
        processedAt: data.processedAt?.toDate?.() || (data.processedAt ? new Date(data.processedAt) : undefined),
        verificationDetails: data.verificationDetails ? {
          ...data.verificationDetails,
          submittedAt: data.verificationDetails.submittedAt?.toDate?.() || new Date(data.verificationDetails.submittedAt),
        } : undefined,
      } as PaymentRequest;
    });
  } catch (error) {
    console.error('Error fetching payment requests:', error);
    return [];
  }
};

/**
 * Admin: Approve payment request and add coins to user wallet
 */
export const approvePaymentRequest = async (
  paymentRequestId: string,
  adminUserId: string,
  adminNotes?: string
): Promise<void> => {
  try {
    const paymentRequest = await getPaymentRequest(paymentRequestId);
    if (!paymentRequest) {
      throw new Error('Payment request not found');
    }
    
    // Add coins to user's wallet balance
    await addToWalletBalance(paymentRequest.userId, paymentRequest.fogCoinsAmount);
    
    // Add to deposit earnings
    await addDepositEarnings(paymentRequest.userId, paymentRequest.fogCoinsAmount);
    
    // Update payment request status
    const paymentRef = doc(db, PAYMENT_REQUESTS_COLLECTION, paymentRequestId);
    await updateDoc(paymentRef, {
      status: 'approved',
      processedAt: Timestamp.now(),
      processedBy: adminUserId,
      adminNotes: adminNotes || 'Payment approved and coins deposited'
    });
  } catch (error) {
    console.error('Error approving payment request:', error);
    throw error;
  }
};

/**
 * Admin: Reject payment request
 */
export const rejectPaymentRequest = async (
  paymentRequestId: string,
  adminUserId: string,
  adminNotes: string
): Promise<void> => {
  try {
    const paymentRef = doc(db, PAYMENT_REQUESTS_COLLECTION, paymentRequestId);
    await updateDoc(paymentRef, {
      status: 'rejected',
      processedAt: Timestamp.now(),
      processedBy: adminUserId,
      adminNotes
    });
  } catch (error) {
    console.error('Error rejecting payment request:', error);
    throw error;
  }
};

/**
 * Initialize default bank accounts (run once)
 */
export const initializeDefaultBankAccounts = async (): Promise<void> => {
  try {
    // PKR accounts
    const pkrAccounts: Omit<BankAccount, 'id'>[] = [
      {
        currency: 'PKR',
        bankName: 'Meezan Bank',
        accountHolderName: 'RUL UL HASSNAIN',
        accountNumber: '08320107924427',
        iban: 'PK81MEZN0008320107924427',
        branchName: 'CHAKRA BRANCH RWP',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        currency: 'PKR',
        bankName: 'Easypaisa',
        accountHolderName: 'RUL UL HASSNAIN',
        accountNumber: '03185600791',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    
    // USD accounts
    const usdAccounts: Omit<BankAccount, 'id'>[] = [
      {
        currency: 'USD',
        bankName: 'USDC (TRC20)',
        accountHolderName: 'FOGSLY',
        accountNumber: 'TVof1XBSK115738uhPqLATBnLbt83mjq2s',
        address: 'TVof1XBSK115738uhPqLATBnLbt83mjq2s',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    
    // Add all accounts
    const allAccounts = [...pkrAccounts, ...usdAccounts];
    for (const account of allAccounts) {
      await addDoc(collection(db, BANK_ACCOUNTS_COLLECTION), {
        ...account,
        createdAt: Timestamp.fromDate(account.createdAt),
        updatedAt: Timestamp.fromDate(account.updatedAt),
      });
    }
    
    console.log('Default bank accounts initialized successfully');
  } catch (error) {
    console.error('Error initializing bank accounts:', error);
    throw error;
  }
};

/**
 * Admin: Add a new bank account
 */
export const addBankAccount = async (accountData: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankAccount> => {
  try {
    const newAccount = {
      ...accountData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, BANK_ACCOUNTS_COLLECTION), newAccount);
    
    return {
      id: docRef.id,
      ...accountData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error adding bank account:', error);
    throw error;
  }
};

/**
 * Admin: Update an existing bank account
 */
export const updateBankAccount = async (
  accountId: string, 
  updates: Partial<Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<BankAccount> => {
  try {
    const accountRef = doc(db, BANK_ACCOUNTS_COLLECTION, accountId);
    
    await updateDoc(accountRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    const updatedDoc = await getDoc(accountRef);
    if (!updatedDoc.exists()) {
      throw new Error('Bank account not found after update');
    }

    const data = updatedDoc.data();
    return {
      id: updatedDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
    } as BankAccount;
  } catch (error) {
    console.error('Error updating bank account:', error);
    throw error;
  }
};

/**
 * Admin: Delete a bank account
 */
export const deleteBankAccount = async (accountId: string): Promise<void> => {
  try {
    const accountRef = doc(db, BANK_ACCOUNTS_COLLECTION, accountId);
    await deleteDoc(accountRef);
  } catch (error) {
    console.error('Error deleting bank account:', error);
    throw error;
  }
};

/**
 * Get all bank accounts (for admin)
 */
export const getAllBankAccounts = async (): Promise<BankAccount[]> => {
  try {
    const accountsQuery = query(
      collection(db, BANK_ACCOUNTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(accountsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
    })) as BankAccount[];
  } catch (error) {
    console.error('Error fetching all bank accounts:', error);
    return [];
  }
};
