// Theme integration service to connect Firestore themes with the main app

import { getActiveThemes, applyThemeToDocument } from './themeService';
import { initializeDefaultThemes } from './adminSetupService';
import { CustomTheme } from '../types/admin';
import { ThemeOption } from '../../types';

/**
 * Load and apply themes from Firestore to the main application
 */
export const loadAndApplyThemes = async (): Promise<CustomTheme[]> => {
  try {
    // Get active themes from Firestore
    const activeThemes = await getActiveThemes();
    
    // Find the default theme
    const defaultTheme = activeThemes.find(theme => theme.isDefault);
    
    if (defaultTheme) {
      // Apply the default theme
      applyThemeToDocument(defaultTheme);
    }
    
    return activeThemes;
  } catch (error) {
    console.error('Error loading themes:', error);
    return [];
  }
};

/**
 * Update the theme options in the header component
 */
export const getThemeOptions = async (): Promise<ThemeOption[]> => {
  try {
    let activeThemes = await getActiveThemes();
    
    // If no themes exist, initialize default themes
    if (activeThemes.length === 0) {
      console.log('No themes found, initializing default themes...');
      await initializeDefaultThemes();
      activeThemes = await getActiveThemes();
    }
    
    return activeThemes.map(theme => ({
      id: theme.name,
      name: theme.name,
      displayName: theme.displayName,
      colors: {
        preview: theme.colors.primary
      }
    }));
  } catch (error) {
    console.error('Error getting theme options:', error);
    // Return fallback themes with hardcoded colors
    return [
      { 
        id: 'light', 
        name: 'light', 
        displayName: 'Light',
        colors: { preview: '#3B82F6' }
      },
      { 
        id: 'dark', 
        name: 'dark', 
        displayName: 'Dark',
        colors: { preview: '#1F2937' }
      },
      { 
        id: 'desert', 
        name: 'desert', 
        displayName: 'Desert',
        colors: { preview: '#F59E0B' }
      }
    ];
  }
};

/**
 * Apply theme by name
 */
export const applyThemeByName = async (themeName: string): Promise<void> => {
  try {
    const activeThemes = await getActiveThemes();
    const theme = activeThemes.find(t => t.name === themeName);
    
    if (theme) {
      applyThemeToDocument(theme);
      // Store the selected theme in localStorage
      localStorage.setItem('selectedTheme', themeName);
    } else {
      console.warn(`Theme '${themeName}' not found`);
    }
  } catch (error) {
    console.error('Error applying theme:', error);
  }
};

/**
 * Get the currently selected theme from localStorage
 */
export const getCurrentThemeName = (): string => {
  return localStorage.getItem('selectedTheme') || 'light';
};

/**
 * Initialize theme system on app startup
 */
export const initializeThemeSystem = async (): Promise<string> => {
  try {
    // Load active themes
    let activeThemes = await getActiveThemes();
    
    // If no themes exist, initialize default themes
    if (activeThemes.length === 0) {
      console.log('No themes found, initializing default themes...');
      await initializeDefaultThemes();
      activeThemes = await getActiveThemes();
    }
    
    // Get stored theme preference
    const storedTheme = getCurrentThemeName();
    
    // Try to apply stored theme, fallback to default
    const themeToApply = activeThemes.find(t => t.name === storedTheme) || 
                         activeThemes.find(t => t.isDefault) ||
                         activeThemes[0];
    
    if (themeToApply) {
      applyThemeToDocument(themeToApply);
      return themeToApply.name;
    }
    
    return 'light'; // Ultimate fallback
  } catch (error) {
    console.error('Error initializing theme system:', error);
    return 'light';
  }
};

/**
 * Refresh theme options (to be called when themes are updated in admin)
 */
export const refreshThemeOptions = async (): Promise<ThemeOption[]> => {
  try {
    const activeThemes = await getActiveThemes();
    
    return activeThemes.map(theme => ({
      id: theme.name,
      name: theme.name,
      displayName: theme.displayName,
      colors: {
        preview: theme.colors.primary
      }
    }));
  } catch (error) {
    console.error('Error refreshing theme options:', error);
    return [];
  }
};
