import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  AuthError
} from "firebase/auth";
import { auth } from "../config";
import { LoginData, SignupData, AuthResponse, User } from "../types/user";
import { getAuthErrorMessage, validateAuthForm } from "../utils/errorMessages";

/**
 * Sign up a new user with email and password
 */
export const signUp = async (signupData: SignupData): Promise<AuthResponse> => {
  try {
    const { email, password, name } = signupData;
    
    // Validate form data before attempting signup
    const validation = validateAuthForm(email, password, name, true);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors[0] // Return first validation error
      };
    }
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Update the user's display name
    await updateProfile(firebaseUser, {
      displayName: name
    });
    
    // Convert Firebase user to our User type
    const user: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: name,
      emailVerified: firebaseUser.emailVerified,
      createdAt: new Date(),
      lastLoginAt: new Date()
    };
    
    return {
      success: true,
      user
    };
  } catch (error: any) {
    console.error("Error signing up:", error);
    
    // Handle Firebase Auth errors with user-friendly messages
    const errorCode = error.code as string;
    const userFriendlyMessage = getAuthErrorMessage(errorCode);
    
    return {
      success: false,
      error: userFriendlyMessage
    };
  }
};

/**
 * Sign in an existing user with email and password
 */
export const signIn = async (loginData: LoginData): Promise<AuthResponse> => {
  try {
    const { email, password } = loginData;
    
    // Validate form data before attempting login
    const validation = validateAuthForm(email, password, undefined, false);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors[0] // Return first validation error
      };
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Convert Firebase user to our User type
    const user: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || undefined,
      emailVerified: firebaseUser.emailVerified,
      lastLoginAt: new Date()
    };
    
    return {
      success: true,
      user
    };
  } catch (error: any) {
    console.error("Error signing in:", error);
    
    // Handle Firebase Auth errors with user-friendly messages
    const errorCode = error.code as string;
    const userFriendlyMessage = getAuthErrorMessage(errorCode);
    
    return {
      success: false,
      error: userFriendlyMessage
    };
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Listen to authentication state changes
 */
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Convert Firebase User to our User type
 */
export const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName || undefined,
    emailVerified: firebaseUser.emailVerified
  };
};
