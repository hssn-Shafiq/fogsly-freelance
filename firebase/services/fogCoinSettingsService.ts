import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc,
  query, 
  orderBy, 
  limit,
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config';
import { 
  FogCoinSettings, 
  FogCoinSettingsFormData, 
  FogCoinSettingsHistory,
  DEFAULT_FOG_COIN_SETTINGS 
} from '../types/fogCoinSettings';

// Collection names
const FOG_COIN_SETTINGS_COLLECTION = 'fogCoinSettings';
const FOG_COIN_SETTINGS_HISTORY_COLLECTION = 'fogCoinSettingsHistory';

// Current settings document ID (always use 'current' as the ID)
const CURRENT_SETTINGS_DOC_ID = 'current';

/**
 * Get current FOG coin settings
 * Returns default settings if none exist
 */
export const getFogCoinSettings = async (): Promise<FogCoinSettings> => {
  try {
    const settingsRef = doc(db, FOG_COIN_SETTINGS_COLLECTION, CURRENT_SETTINGS_DOC_ID);
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      return {
        id: settingsDoc.id,
        fogToUsdRate: data.fogToUsdRate,
        minimumWithdrawAmount: data.minimumWithdrawAmount,
        maximumDailyEarnings: data.maximumDailyEarnings,
        isWithdrawalsEnabled: data.isWithdrawalsEnabled,
        lastUpdatedBy: data.lastUpdatedBy,
        lastUpdatedAt: data.lastUpdatedAt?.toDate?.() || new Date(data.lastUpdatedAt),
        effectiveFrom: data.effectiveFrom?.toDate?.() || new Date(data.effectiveFrom),
        notes: data.notes
      };
    } else {
      // Return default settings if none exist
      const defaultSettings: FogCoinSettings = {
        id: CURRENT_SETTINGS_DOC_ID,
        ...DEFAULT_FOG_COIN_SETTINGS,
        lastUpdatedBy: 'system',
        lastUpdatedAt: new Date(),
        effectiveFrom: new Date()
      };
      
      // Save default settings to database
      await setDoc(settingsRef, {
        ...defaultSettings,
        lastUpdatedAt: Timestamp.fromDate(defaultSettings.lastUpdatedAt),
        effectiveFrom: Timestamp.fromDate(defaultSettings.effectiveFrom)
      });
      
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error fetching FOG coin settings:', error);
    // Return default settings as fallback
    return {
      id: CURRENT_SETTINGS_DOC_ID,
      ...DEFAULT_FOG_COIN_SETTINGS,
      lastUpdatedBy: 'system',
      lastUpdatedAt: new Date(),
      effectiveFrom: new Date()
    };
  }
};

/**
 * Update FOG coin settings (admin only)
 */
export const updateFogCoinSettings = async (
  formData: FogCoinSettingsFormData,
  adminId: string,
  changeReason: string
): Promise<void> => {
  try {
    console.log('Starting FOG coin settings update...', { formData, adminId, changeReason });
    
    // Get current settings for history
    const currentSettings = await getFogCoinSettings();
    console.log('Current settings retrieved:', currentSettings);
    
    // Create new settings
    const newSettings: FogCoinSettings = {
      id: CURRENT_SETTINGS_DOC_ID,
      fogToUsdRate: Number(formData.fogToUsdRate),
      minimumWithdrawAmount: Number(formData.minimumWithdrawAmount),
      maximumDailyEarnings: Number(formData.maximumDailyEarnings),
      isWithdrawalsEnabled: Boolean(formData.isWithdrawalsEnabled),
      lastUpdatedBy: adminId,
      lastUpdatedAt: new Date(),
      effectiveFrom: new Date(),
      notes: formData.notes || ''
    };
    
    console.log('New settings prepared:', newSettings);
    
    // Save to current settings
    const settingsRef = doc(db, FOG_COIN_SETTINGS_COLLECTION, CURRENT_SETTINGS_DOC_ID);
    const settingsData = {
      ...newSettings,
      lastUpdatedAt: Timestamp.fromDate(newSettings.lastUpdatedAt),
      effectiveFrom: Timestamp.fromDate(newSettings.effectiveFrom)
    };
    
    console.log('Saving settings to Firestore...', settingsData);
    await setDoc(settingsRef, settingsData);
    console.log('Settings saved successfully');
    
    // Save to history
    const historyEntry: Omit<FogCoinSettingsHistory, 'id'> = {
      settings: currentSettings, // Save the previous settings
      changeReason,
      changedBy: adminId,
      changedAt: new Date()
    };
    
    const historyData = {
      ...historyEntry,
      changedAt: Timestamp.fromDate(historyEntry.changedAt),
      settings: {
        ...historyEntry.settings,
        lastUpdatedAt: Timestamp.fromDate(historyEntry.settings.lastUpdatedAt),
        effectiveFrom: Timestamp.fromDate(historyEntry.settings.effectiveFrom)
      }
    };
    
    console.log('Saving history entry...', historyData);
    await addDoc(collection(db, FOG_COIN_SETTINGS_HISTORY_COLLECTION), historyData);
    console.log('History saved successfully');
    
  } catch (error) {
    console.error('Error updating FOG coin settings:', error);
    throw new Error(`Failed to update FOG coin settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get FOG coin settings history (admin only)
 */
export const getFogCoinSettingsHistory = async (limitCount = 20): Promise<FogCoinSettingsHistory[]> => {
  try {
    const historyQuery = query(
      collection(db, FOG_COIN_SETTINGS_HISTORY_COLLECTION),
      orderBy('changedAt', 'desc'),
      limit(limitCount)
    );
    
    const historySnapshot = await getDocs(historyQuery);
    
    return historySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        settings: {
          ...data.settings,
          lastUpdatedAt: data.settings.lastUpdatedAt?.toDate?.() || new Date(data.settings.lastUpdatedAt),
          effectiveFrom: data.settings.effectiveFrom?.toDate?.() || new Date(data.settings.effectiveFrom)
        },
        changeReason: data.changeReason,
        changedBy: data.changedBy,
        changedAt: data.changedAt?.toDate?.() || new Date(data.changedAt)
      } as FogCoinSettingsHistory;
    });
  } catch (error) {
    console.error('Error fetching FOG coin settings history:', error);
    throw new Error('Failed to fetch FOG coin settings history');
  }
};

/**
 * Validate FOG coin settings
 */
export const validateFogCoinSettings = (formData: FogCoinSettingsFormData): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};
  
  if (formData.fogToUsdRate < 0.01 || formData.fogToUsdRate > 1.00) {
    errors.fogToUsdRate = 'Rate must be between $0.01 and $1.00 per FOG coin';
  }
  
  if (formData.minimumWithdrawAmount < 10 || formData.minimumWithdrawAmount > 10000) {
    errors.minimumWithdrawAmount = 'Minimum withdrawal must be between 10 and 10,000 FOG coins';
  }
  
  if (formData.maximumDailyEarnings < 10 || formData.maximumDailyEarnings > 1000) {
    errors.maximumDailyEarnings = 'Daily earnings limit must be between 10 and 1,000 FOG coins';
  }
  
  if (formData.minimumWithdrawAmount >= formData.maximumDailyEarnings) {
    errors.minimumWithdrawAmount = 'Minimum withdrawal must be less than daily earnings limit';
  }
  
  return errors;
};
