// Theme management service for admin panel

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../config";
import { CustomTheme, ThemeCreationData, ThemeColors } from "../types/admin";

/**
 * Get all custom themes from Firestore
 */
export const getAllThemes = async (): Promise<CustomTheme[]> => {
  try {
    const themesRef = collection(db, 'customThemes');
    const q = query(themesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as CustomTheme[];
  } catch (error) {
    console.error("Error fetching themes:", error);
    throw new Error("Failed to fetch themes");
  }
};

/**
 * Get active themes only
 */
export const getActiveThemes = async (): Promise<CustomTheme[]> => {
  try {
    const themesRef = collection(db, 'customThemes');
    const q = query(themesRef, where('isActive', '==', true), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as CustomTheme[];
  } catch (error) {
    console.error("Error fetching active themes:", error);
    throw new Error("Failed to fetch active themes");
  }
};

/**
 * Get a single theme by ID
 */
export const getThemeById = async (themeId: string): Promise<CustomTheme | null> => {
  try {
    const themeDoc = await getDoc(doc(db, 'customThemes', themeId));
    
    if (!themeDoc.exists()) {
      return null;
    }
    
    const data = themeDoc.data();
    return {
      id: themeDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as CustomTheme;
  } catch (error) {
    console.error("Error fetching theme:", error);
    throw new Error("Failed to fetch theme");
  }
};

/**
 * Create a new custom theme
 */
export const createTheme = async (
  themeData: ThemeCreationData, 
  createdBy: string
): Promise<string> => {
  try {
    // Check if theme name already exists
    const existingThemes = await getDocs(
      query(collection(db, 'customThemes'), where('name', '==', themeData.name))
    );
    
    if (!existingThemes.empty) {
      throw new Error("Theme name already exists");
    }
    
    const newTheme = {
      name: themeData.name,
      displayName: themeData.displayName,
      colors: themeData.colors,
      isActive: true,
      isDefault: false,
      createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'customThemes'), newTheme);
    return docRef.id;
  } catch (error) {
    console.error("Error creating theme:", error);
    throw error;
  }
};

/**
 * Update an existing theme
 */
export const updateTheme = async (
  themeId: string, 
  updates: Partial<ThemeCreationData>
): Promise<void> => {
  try {
    const themeRef = doc(db, 'customThemes', themeId);
    
    await updateDoc(themeRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating theme:", error);
    throw new Error("Failed to update theme");
  }
};

/**
 * Toggle theme active status
 */
export const toggleThemeStatus = async (themeId: string): Promise<void> => {
  try {
    const themeDoc = await getDoc(doc(db, 'customThemes', themeId));
    
    if (!themeDoc.exists()) {
      throw new Error("Theme not found");
    }
    
    const currentStatus = themeDoc.data().isActive;
    const themeRef = doc(db, 'customThemes', themeId);
    
    await updateDoc(themeRef, {
      isActive: !currentStatus,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error toggling theme status:", error);
    throw new Error("Failed to toggle theme status");
  }
};

/**
 * Delete a custom theme
 */
export const deleteTheme = async (themeId: string): Promise<void> => {
  try {
    const themeDoc = await getDoc(doc(db, 'customThemes', themeId));
    
    if (!themeDoc.exists()) {
      throw new Error("Theme not found");
    }
    
    const themeData = themeDoc.data();
    
    // Prevent deleting default themes
    if (themeData.isDefault) {
      throw new Error("Cannot delete default theme");
    }
    
    await deleteDoc(doc(db, 'customThemes', themeId));
  } catch (error) {
    console.error("Error deleting theme:", error);
    throw error;
  }
};

/**
 * Set theme as default
 */
export const setDefaultTheme = async (themeId: string): Promise<void> => {
  try {
    // First, remove default status from all themes
    const themesRef = collection(db, 'customThemes');
    const allThemes = await getDocs(themesRef);
    
    const batch = await import("firebase/firestore").then(module => module.writeBatch(db));
    
    // Remove default from all themes
    allThemes.docs.forEach(doc => {
      batch.update(doc.ref, { isDefault: false });
    });
    
    // Set new default theme
    const newDefaultRef = doc(db, 'customThemes', themeId);
    batch.update(newDefaultRef, { 
      isDefault: true,
      isActive: true,
      updatedAt: serverTimestamp()
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error setting default theme:", error);
    throw new Error("Failed to set default theme");
  }
};

/**
 * Get default theme colors as CSS variables string
 */
export const getThemeCSSVariables = (colors: ThemeColors): string => {
  return `
    --color-bg-primary: ${colors.bgPrimary};
    --color-bg-secondary: ${colors.bgSecondary};
    --color-bg-tertiary: ${colors.bgTertiary};
    --color-text-primary: ${colors.textPrimary};
    --color-text-secondary: ${colors.textSecondary};
    --color-primary: ${colors.primary};
    --color-accent: ${colors.accent};
    --color-border: ${colors.border};
    --color-card: ${colors.card};
    --color-success-bg: ${colors.successBg};
    --color-success-fg: ${colors.successFg};
    --color-success-icon: ${colors.successIcon};
  `.trim();
};

/**
 * Apply theme to document
 */
export const applyThemeToDocument = (theme: CustomTheme): void => {
  const root = document.documentElement;
  const cssVariables = getThemeCSSVariables(theme.colors);
  
  // Apply CSS variables to root element
  cssVariables.split(';').forEach(variable => {
    if (variable.trim()) {
      const [property, value] = variable.split(':').map(s => s.trim());
      root.style.setProperty(property, value);
    }
  });
  
  // Also set class for compatibility
  root.className = theme.name;
};
