import { initializeUserCounter } from './rankingService';

/**
 * Initialize the FOGSLY system
 * Run this once when setting up the application
 */
export const initializeFOGSLYSystem = async (): Promise<void> => {
  try {
    console.log('Initializing FOGSLY system...');
    
    // Initialize user ranking counter
    await initializeUserCounter();
    
    console.log('FOGSLY system initialized successfully!');
  } catch (error) {
    console.error('Error initializing FOGSLY system:', error);
    throw error;
  }
};