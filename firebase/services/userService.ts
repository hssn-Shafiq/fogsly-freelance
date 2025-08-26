import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from "../config";
import { UserData, UserProfile } from "../types/user";
import { createUserWallet } from './walletService';
import { initializeUserEarnings } from './earningsService';
import { getNextUserRank, createUserRanking } from './rankingService';

// Collections
const USERS_COLLECTION = "users";
const USER_PROFILES_COLLECTION = "userProfile";

/**
 * Create a new user document in the users collection
 */
export const createUserData = async (userData: Omit<UserData, 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userData.uid);
    
    await setDoc(userRef, {
      ...userData,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("User data created successfully");
  } catch (error) {
    console.error("Error creating user data:", error);
    throw error;
  }
};

/**
 * Create a new user profile document in the userProfile collection
 */
export const createUserProfile = async (profileData: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const profileRef = doc(db, USER_PROFILES_COLLECTION, profileData.uid);
    
    await setDoc(profileRef, {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("User profile created successfully");
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

/**
 * Get user data by UID
 */
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as UserData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

/**
 * Get user profile by user ID
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const profileRef = doc(db, USER_PROFILES_COLLECTION, userId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

/**
 * Update user data
 */
export const updateUserData = async (uid: string, updates: Partial<Omit<UserData, 'uid' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log("User data updated successfully");
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const profileRef = doc(db, USER_PROFILES_COLLECTION, userId);
    
    await updateDoc(profileRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log("User profile updated successfully");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Check if user exists by email
 */
export const checkUserExistsByEmail = async (email: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    throw error;
  }
};

/**
 * Complete user setup (create both user data and profile) with ranking
 */
export const setupNewUser = async (uid: string, email: string, name: string): Promise<void> => {
  try {
    // Get the next user rank atomically
    const userRank = await getNextUserRank();
    
    // Create user data with rank
    await createUserData({
      uid,
      email,
      name,
      status: 'active',
      role: 'user', // Default role for new users (admin can change this later)
      rank: userRank
    });
    
    // Create user profile with rank
    await createUserProfile({
      uid, // Changed from userId to uid to match interface
      name,
      email,
      role: 'User', // Default display role for profile
      bio: `Hello! I'm ${name}. Welcome to my profile.`,
      rank: userRank
    });
    
    // Create user ranking record
    await createUserRanking(uid, userRank, email, name);
    
    // Create user wallet with QR code
    await createUserWallet(uid, name, email);
    
    // Initialize user earnings tracking
    await initializeUserEarnings(uid);
    
    console.log(`New user setup completed successfully - ${name} is rank #${userRank}`);
  } catch (error) {
    console.error("Error setting up new user:", error);
    throw error;
  }
};

/**
 * Upload avatar image to Firebase Storage
 */
export const uploadAvatarImage = async (file: File, userId: string): Promise<string> => {
  try {
    const fileName = `users/${userId}/avatar.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading avatar image:', error);
    throw new Error('Failed to upload avatar image');
  }
};

/**
 * Upload cover image to Firebase Storage
 */
export const uploadCoverImage = async (file: File, userId: string): Promise<string> => {
  try {
    const fileName = `users/${userId}/cover.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading cover image:', error);
    throw new Error('Failed to upload cover image');
  }
};

/**
 * Update user profile with new avatar URL
 */
export const updateUserAvatar = async (userId: string, avatarUrl: string): Promise<void> => {
  try {
    const profileRef = doc(db, USER_PROFILES_COLLECTION, userId);
    await updateDoc(profileRef, {
      avatarUrl,
      updatedAt: serverTimestamp()
    });
    console.log('Avatar URL updated successfully');
  } catch (error) {
    console.error('Error updating avatar URL:', error);
    throw error;
  }
};

/**
 * Update user profile with new cover URL
 */
export const updateUserCover = async (userId: string, coverUrl: string): Promise<void> => {
  try {
    const profileRef = doc(db, USER_PROFILES_COLLECTION, userId);
    await updateDoc(profileRef, {
      coverUrl,
      updatedAt: serverTimestamp()
    });
    console.log('Cover URL updated successfully');
  } catch (error) {
    console.error('Error updating cover URL:', error);
    throw error;
  }
};
