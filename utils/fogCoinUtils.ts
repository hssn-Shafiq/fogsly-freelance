// FOG Coin utility functions with dynamic pricing
import { getFogCoinSettings } from '../firebase/services/fogCoinSettingsService';
import { FogCoinSettings } from '../firebase/types/fogCoinSettings';

// Cache for settings to avoid frequent database calls
let cachedSettings: FogCoinSettings | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get current FOG coin settings with caching
 */
export const getFogCoinSettingsWithCache = async (): Promise<FogCoinSettings> => {
  const now = Date.now();
  
  if (cachedSettings && now < cacheExpiry) {
    return cachedSettings;
  }
  
  try {
    cachedSettings = await getFogCoinSettings();
    cacheExpiry = now + CACHE_DURATION;
    return cachedSettings;
  } catch (error) {
    console.error('Error fetching FOG coin settings, using fallback:', error);
    // Fallback to default rate if service fails
    return {
      id: 'fallback',
      fogToUsdRate: 0.10,
      minimumWithdrawAmount: 50,
      maximumDailyEarnings: 100,
      isWithdrawalsEnabled: true,
      lastUpdatedBy: 'system',
      lastUpdatedAt: new Date(),
      effectiveFrom: new Date(),
      notes: 'Fallback settings'
    };
  }
};

/**
 * Clear the settings cache (call when settings are updated)
 */
export const clearFogCoinSettingsCache = (): void => {
  cachedSettings = null;
  cacheExpiry = 0;
};

/**
 * Convert FOG coins to USD using current rate
 * @param fogAmount - Amount in FOG coins
 * @param settings - Optional settings object to avoid async call
 * @returns USD value as number
 */
export const fogToUsd = async (fogAmount: number, settings?: FogCoinSettings): Promise<number> => {
  const currentSettings = settings || await getFogCoinSettingsWithCache();
  return fogAmount * currentSettings.fogToUsdRate;
};

/**
 * Convert USD to FOG coins using current rate
 * @param usdAmount - Amount in USD
 * @param settings - Optional settings object to avoid async call
 * @returns FOG coin value as number
 */
export const usdToFog = async (usdAmount: number, settings?: FogCoinSettings): Promise<number> => {
  const currentSettings = settings || await getFogCoinSettingsWithCache();
  return usdAmount / currentSettings.fogToUsdRate;
};

/**
 * Synchronous version of fogToUsd for when you already have settings
 * @param fogAmount - Amount in FOG coins
 * @param fogToUsdRate - Current conversion rate
 * @returns USD value as number
 */
export const fogToUsdSync = (fogAmount: number, fogToUsdRate: number): number => {
  return fogAmount * fogToUsdRate;
};

/**
 * Format FOG coins for display
 * @param fogAmount - Amount in FOG coins
 * @param showDecimals - Whether to show decimal places (default: false)
 * @returns Formatted FOG string
 */
export const formatFog = (fogAmount: number, showDecimals = false): string => {
  if (showDecimals) {
    return `${fogAmount.toFixed(2)} FOG`;
  }
  return `${Math.floor(fogAmount)} FOG`;
};

/**
 * Format USD for display
 * @param usdAmount - Amount in USD
 * @returns Formatted USD string
 */
export const formatUsd = (usdAmount: number): string => {
  return `$${usdAmount.toFixed(2)}`;
};

/**
 * Format FOG coins with USD equivalent (async)
 * @param fogAmount - Amount in FOG coins
 * @param showDecimals - Whether to show decimal places for FOG (default: false)
 * @param settings - Optional settings object to avoid async call
 * @returns Formatted string with both FOG and USD
 */
export const formatFogWithUsd = async (fogAmount: number, showDecimals = false, settings?: FogCoinSettings): Promise<string> => {
  const fog = formatFog(fogAmount, showDecimals);
  const usd = formatUsd(await fogToUsd(fogAmount, settings));
  return `${fog} (≈ ${usd})`;
};

/**
 * Synchronous version of formatFogWithUsd for when you already have settings
 * @param fogAmount - Amount in FOG coins
 * @param fogToUsdRate - Current conversion rate
 * @param showDecimals - Whether to show decimal places for FOG (default: false)
 * @returns Formatted string with both FOG and USD
 */
export const formatFogWithUsdSync = (fogAmount: number, fogToUsdRate: number, showDecimals = false): string => {
  const fog = formatFog(fogAmount, showDecimals);
  const usd = formatUsd(fogToUsdSync(fogAmount, fogToUsdRate));
  return `${fog} (≈ ${usd})`;
};

/**
 * Validate FOG amount within reasonable bounds
 * @param fogAmount - Amount to validate
 * @returns Whether amount is valid
 */
export const isValidFogAmount = (fogAmount: number): boolean => {
  return fogAmount >= 0 && fogAmount <= 10000 && Number.isFinite(fogAmount);
};
