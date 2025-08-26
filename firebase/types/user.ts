// User type for authentication
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  lastLoginAt?: Date;
}

// User data stored in users collection
export interface UserData {
  uid: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  role: 'user' | 'admin';
  rank?: number; // Add rank field
  createdAt: Date;
  updatedAt: Date;
}

// User profile data stored in userProfile collection
export interface UserProfile {
  uid: string;
  name: string;
  displayName?: string;
  email: string;
  role: string;
  city?: string;
  country?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  social?: {
    linkedin?: string;
    twitter?: string;
    dribbble?: string;
    github?: string;
  };
  avatarUrl?: string;
  coverUrl?: string;
  rank?: number; // Add rank field
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRanking {
  userId: string;
  rank: number;
  email: string;
  name: string;
  signupDate: Date;
  isActive: boolean;
  createdAt: Date;
}

// Auth form data types
export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

// Auth response type
export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}
