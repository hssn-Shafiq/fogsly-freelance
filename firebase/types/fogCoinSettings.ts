// Types for FOG Coin pricing and settings management

export interface FogCoinSettings {
  id: string; // Document ID
  fogToUsdRate: number; // Current conversion rate (e.g., 0.10 means 1 FOG = $0.10)
  minimumWithdrawAmount: number; // Minimum FOG coins required to withdraw
  maximumDailyEarnings: number; // Maximum FOG coins a user can earn per day
  isWithdrawalsEnabled: boolean; // Global toggle for withdrawals
  lastUpdatedBy: string; // Admin user ID who last updated
  lastUpdatedAt: Date; // Timestamp of last update
  effectiveFrom: Date; // When this rate becomes effective
  notes?: string; // Optional admin notes about the change
}

export interface FogCoinSettingsFormData {
  fogToUsdRate: number;
  minimumWithdrawAmount: number;
  maximumDailyEarnings: number;
  isWithdrawalsEnabled: boolean;
  notes?: string;
}

export interface FogCoinSettingsHistory {
  id: string;
  settings: FogCoinSettings;
  changeReason: string;
  changedBy: string;
  changedAt: Date;
}

// Default settings (fallback if no settings exist)
export const DEFAULT_FOG_COIN_SETTINGS: Omit<FogCoinSettings, 'id' | 'lastUpdatedBy' | 'lastUpdatedAt' | 'effectiveFrom'> = {
  fogToUsdRate: 0.10, // 1 FOG = $0.10
  minimumWithdrawAmount: 50, // Minimum 50 FOG to withdraw
  maximumDailyEarnings: 100, // Maximum 100 FOG per day
  isWithdrawalsEnabled: true,
  notes: 'Default FOG coin settings'
};

// Validation constants
export const FOG_COIN_VALIDATION = {
  MIN_RATE: 0.01, // Minimum $0.01 per FOG
  MAX_RATE: 1.00, // Maximum $1.00 per FOG
  MIN_WITHDRAW_AMOUNT: 10, // Minimum 10 FOG
  MAX_WITHDRAW_AMOUNT: 10000, // Maximum 10,000 FOG
  MIN_DAILY_EARNINGS: 10, // Minimum 10 FOG per day
  MAX_DAILY_EARNINGS: 1000, // Maximum 1,000 FOG per day
};
