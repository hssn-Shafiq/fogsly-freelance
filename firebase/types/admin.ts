// Admin-specific types and interfaces

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'super-admin';
  displayName?: string;
  permissions: AdminPermission[];
  createdAt: Date;
  lastLoginAt: Date;
}

export type AdminPermission = 
  | 'theme-management'
  | 'user-management' 
  | 'content-management'
  | 'ads-management'
  | 'analytics-view'
  | 'system-settings';

export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  primary: string;
  accent: string;
  border: string;
  card: string;
  successBg: string;
  successFg: string;
  successIcon: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  displayName: string;
  colors: ThemeColors;
  isActive: boolean;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminAuthResponse {
  success: boolean;
  admin?: AdminUser;
  error?: string;
}

export type AdminRoute = 
  | 'dashboard'
  | 'theme-management'
  | 'user-management'
  | 'content-management'
  | 'ads-management'
  | 'analytics'
  | 'settings';

export interface ThemeCreationData {
  name: string;
  displayName: string;
  colors: ThemeColors;
}
