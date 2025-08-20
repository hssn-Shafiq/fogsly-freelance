// Admin authentication service

import { 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config";
import { AdminUser, AdminAuthResponse } from "../types/admin";

/**
 * Admin login with email and password
 * Checks if user has admin privileges in Firestore
 */
export const adminSignIn = async (email: string, password: string): Promise<AdminAuthResponse> => {
  try {
    // First authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Check if user has admin privileges in Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      // User document doesn't exist
      await signOut(auth); // Sign them out immediately
      return {
        success: false,
        error: 'User not found in system.'
      };
    }
    
    const userData = userDoc.data();
    
    if (userData.role !== 'admin') {
      // User is not an admin
      await signOut(auth); // Sign them out immediately
      return {
        success: false,
        error: 'Access denied. Admin privileges required.'
      };
    }
    
    const adminData = userData;
    const admin: AdminUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      role: 'admin', // From users collection
      displayName: firebaseUser.displayName || userData.name,
      permissions: ['theme-management'], // Default admin permissions
      createdAt: userData.createdAt?.toDate() || new Date(),
      lastLoginAt: new Date()
    };
    
    // Update last login time
    await updateAdminLastLogin(admin.uid);
    
    return {
      success: true,
      admin
    };
  } catch (error: any) {
    console.error("Admin login error:", error);
    
    // Handle specific Firebase Auth errors
    let errorMessage = 'Login failed. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage = 'Invalid email or password.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled.';
        break;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Sign out admin user
 */
export const adminSignOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Admin sign out error:", error);
    throw error;
  }
};

/**
 * Get current admin user if authenticated and has admin privileges
 */
export const getCurrentAdmin = async (): Promise<AdminUser | null> => {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) return null;
    
    const userData = userDoc.data();
    
    // Check if user has admin role
    if (userData.role !== 'admin') return null;
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      role: 'admin',
      displayName: firebaseUser.displayName || userData.name,
      permissions: ['theme-management'],
      createdAt: userData.createdAt?.toDate() || new Date(),
      lastLoginAt: userData.updatedAt?.toDate() || new Date()
    };
  } catch (error) {
    console.error("Error getting current admin:", error);
    return null;
  }
};

/**
 * Listen to admin authentication state changes
 */
export const onAdminAuthStateChange = (callback: (admin: AdminUser | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const admin = await getCurrentAdmin();
      callback(admin);
    } else {
      callback(null);
    }
  });
};

/**
 * Check if current user has specific admin permission
 */
export const hasAdminPermission = async (permission: string): Promise<boolean> => {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return false;
    
    return admin.role === 'super-admin' || admin.permissions.includes(permission as any);
  } catch (error) {
    console.error("Error checking admin permission:", error);
    return false;
  }
};

/**
 * Update admin last login time
 */
const updateAdminLastLogin = async (adminId: string): Promise<void> => {
  try {
    const { updateDoc, serverTimestamp } = await import("firebase/firestore");
    const userRef = doc(db, 'users', adminId);
    await updateDoc(userRef, {
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating admin last login:", error);
    // Don't throw here as it's not critical
  }
};
