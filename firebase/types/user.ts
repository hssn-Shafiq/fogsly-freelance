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
  email: string;
  name: string;
  role: 'user' | 'admin' | 'moderator'; // System role (set by admin)
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

// User profile data stored in userProfile collection
export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role?: string;
  city?: string;
  country?: string;
  phone?: string;
  location?: string; // (legacy, for migration)
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  skills?: string[];
  social?: {
    linkedin?: string;
    twitter?: string;
    dribbble?: string;
    github?: string;
  };
  stats?: {
    rating?: number;
    reviews?: number;
    projects?: number;
    completionRate?: number;
  };
  portfolio?: Array<{
    id: number;
    title: string;
    category: string;
    imageUrl: string;
  }>;
  reviews?: Array<{
    id: number;
    client: string;
    project: string;
    rating: number;
    comment: string;
  }>;
  activity?: Array<{
    type: string;
    content: string;
    time: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
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
