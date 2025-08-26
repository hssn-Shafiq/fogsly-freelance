import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  runTransaction,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../config";

// Collections
const SYSTEM_COUNTERS_COLLECTION = "systemCounters";
const USER_RANKINGS_COLLECTION = "userRankings";

/**
 * Initialize the global user counter (run this once when setting up the system)
 */
export const initializeUserCounter = async (): Promise<void> => {
  try {
    const counterRef = doc(db, SYSTEM_COUNTERS_COLLECTION, "userSignupCounter");
    const counterSnap = await getDoc(counterRef);
    
    if (!counterSnap.exists()) {
      await setDoc(counterRef, {
        totalUsers: 0,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      console.log("User counter initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing user counter:", error);
    throw error;
  }
};

/**
 * Get the next user rank atomically
 */
export const getNextUserRank = async (): Promise<number> => {
  try {
    const counterRef = doc(db, SYSTEM_COUNTERS_COLLECTION, "userSignupCounter");
    
    return await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      if (!counterDoc.exists()) {
        // Initialize counter if it doesn't exist
        transaction.set(counterRef, {
          totalUsers: 1,
          lastUpdated: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        return 1;
      }
      
      const currentCount = counterDoc.data().totalUsers;
      const newRank = currentCount + 1;
      
      // Increment the counter
      transaction.update(counterRef, {
        totalUsers: newRank,
        lastUpdated: serverTimestamp()
      });
      
      return newRank;
    });
  } catch (error) {
    console.error("Error getting next user rank:", error);
    throw error;
  }
};

/**
 * Create user ranking record
 */
export const createUserRanking = async (
  userId: string, 
  rank: number, 
  email: string, 
  name: string
): Promise<void> => {
  try {
    const rankingRef = doc(db, USER_RANKINGS_COLLECTION, userId);
    
    await setDoc(rankingRef, {
      userId,
      rank,
      email,
      name,
      signupDate: serverTimestamp(),
      isActive: true,
      createdAt: serverTimestamp()
    });
    
    console.log(`User ranking created: ${name} is rank #${rank}`);
  } catch (error) {
    console.error("Error creating user ranking:", error);
    throw error;
  }
};

/**
 * Get user rank by user ID
 */
export const getUserRank = async (userId: string): Promise<number | null> => {
  try {
    const rankingRef = doc(db, USER_RANKINGS_COLLECTION, userId);
    const rankingSnap = await getDoc(rankingRef);
    
    if (rankingSnap.exists()) {
      return rankingSnap.data().rank;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user rank:", error);
    throw error;
  }
};

/**
 * Get total user count
 */
export const getTotalUserCount = async (): Promise<number> => {
  try {
    const counterRef = doc(db, SYSTEM_COUNTERS_COLLECTION, "userSignupCounter");
    const counterSnap = await getDoc(counterRef);
    
    if (counterSnap.exists()) {
      return counterSnap.data().totalUsers || 0;
    }
    
    return 0;
  } catch (error) {
    console.error("Error getting total user count:", error);
    throw error;
  }
};

/**
 * Get user ranking with additional details
 */
export const getUserRankingDetails = async (userId: string) => {
  try {
    const rankingRef = doc(db, USER_RANKINGS_COLLECTION, userId);
    const rankingSnap = await getDoc(rankingRef);
    
    if (rankingSnap.exists()) {
      const data = rankingSnap.data();
      return {
        ...data,
        signupDate: data.signupDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date()
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user ranking details:", error);
    throw error;
  }
};