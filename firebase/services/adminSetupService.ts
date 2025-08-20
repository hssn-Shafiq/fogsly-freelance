// Admin initialization and setup utilities

import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config";
import { AdminUser } from "../types/admin";

/**
 * Initialize default themes in Firestore
 */
export const initializeDefaultThemes = async () => {
  try {
    const defaultThemes = [
      {
        name: 'light',
        displayName: 'Light Theme',
        colors: {
          bgPrimary: '#FFFFFF',
          bgSecondary: '#F1F5F9',
          bgTertiary: '#E2E8F0',
          textPrimary: '#0F172A',
          textSecondary: '#475569',
          primary: '#3B82F6',
          accent: '#06B6D4',
          border: '#E2E8F0',
          card: '#FFFFFF',
          successBg: '#F0FDF4',
          successFg: '#15803D',
          successIcon: '#16A34A'
        },
        isActive: true,
        isDefault: true,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'dark',
        displayName: 'Dark Theme',
        colors: {
          bgPrimary: '#020617',
          bgSecondary: '#0f172a',
          bgTertiary: '#1e293b',
          textPrimary: '#F8FAFC',
          textSecondary: '#94A3B8',
          primary: '#60A5FA',
          accent: '#22D3EE',
          border: '#1e293b',
          card: '#0f172a',
          successBg: '#052e16',
          successFg: '#86EFAC',
          successIcon: '#4ADE80'
        },
        isActive: true,
        isDefault: false,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'desert',
        displayName: 'Desert Theme',
        colors: {
          bgPrimary: '#F3EFE4',
          bgSecondary: '#EAE6D9',
          bgTertiary: '#E0DCCF',
          textPrimary: '#2C2C2C',
          textSecondary: '#5A5A5A',
          primary: '#C85738',
          accent: '#7DB1D0',
          border: '#D4D0C3',
          card: '#F3EFE4',
          successBg: '#e8f3e8',
          successFg: '#295229',
          successIcon: '#4a754a'
        },
        isActive: true,
        isDefault: false,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const theme of defaultThemes) {
      const themeRef = doc(collection(db, 'customThemes'));
      await setDoc(themeRef, theme);
    }

    console.log('Default themes initialized');
  } catch (error) {
    console.error('Error initializing default themes:', error);
  }
};

/**
 * Create admin user in Firestore
 * Note: The user must first be created in Firebase Auth, then this adds admin privileges
 */
export const createAdminUser = async (
  uid: string,
  email: string,
  role: 'admin' | 'super-admin' = 'admin',
  permissions: string[] = ['theme-management']
) => {
  try {
    const adminData = {
      email,
      role,
      permissions,
      displayName: email.split('@')[0], // Use part before @ as display name
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    await setDoc(doc(db, 'admins', uid), adminData);
    console.log(`Admin user created: ${email}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

/**
 * Check if admin exists
 */
export const adminExists = async (uid: string): Promise<boolean> => {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    return adminDoc.exists();
  } catch (error) {
    console.error('Error checking admin existence:', error);
    return false;
  }
};

/**
 * Create super admin with all permissions
 */
export const createSuperAdmin = async (uid: string, email: string) => {
  const allPermissions = [
    'theme-management',
    'user-management',
    'content-management',
    'analytics-view',
    'system-settings'
  ];

  await createAdminUser(uid, email, 'super-admin', allPermissions);
};

/**
 * Setup sample admin for testing
 * This should be removed in production
 */
export const setupSampleAdmin = async () => {
  try {
    // This is just for demonstration - you would use a real Firebase Auth UID
    const sampleAdminId = 'sample-admin-id';
    const sampleEmail = 'admin@fogsly.com';

    // Check if sample admin already exists
    const exists = await adminExists(sampleAdminId);
    if (!exists) {
      await createSuperAdmin(sampleAdminId, sampleEmail);
      console.log('Sample admin created for testing');
    }
  } catch (error) {
    console.error('Error setting up sample admin:', error);
  }
};

/**
 * Initialize admin system
 * Call this once to set up default data
 */
export const initializeAdminSystem = async () => {
  try {
    console.log('Initializing admin system...');
    
    // Initialize default themes
    await initializeDefaultThemes();
    
    // Setup sample admin (remove in production)
    await setupSampleAdmin();
    
    console.log('Admin system initialized successfully');
  } catch (error) {
    console.error('Error initializing admin system:', error);
  }
};
