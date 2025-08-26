import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  writeBatch 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config';
import { 
  Ad, 
  AdCreationData, 
  UserAdInteraction, 
  UserAdStats, 
  UserDailyActivity,
  AdQuestion,
  UserContactDetails
} from '../types/ads';
import { addAdsEarnings } from './userEarningsService';

// Collection names
const ADS_COLLECTION = 'ads';
const USER_AD_INTERACTIONS_COLLECTION = 'userAdInteractions';
const USER_AD_STATS_COLLECTION = 'userAdStats';
const USER_DAILY_ACTIVITIES_COLLECTION = 'userDailyActivities';

/**
 * Admin Functions - Create, Read, Update, Delete Ads
 */

export const createAd = async (adData: AdCreationData, adminId: string): Promise<string> => {
  try {
    // Calculate reward per question (only for the first 3 custom questions)
    const rewardPerQuestion = Number((adData.totalReward / 4).toFixed(2)); // 4 total questions (3 custom + 1 feedback)
    
    // Generate the first 3 custom questions
    const customQuestions: AdQuestion[] = adData.questions.map((q, index) => ({
      id: `q_${Date.now()}_${index}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      reward: rewardPerQuestion,
      type: 'multiple-choice'
    }));

    // Add the fixed 4th feedback question
    const feedbackQuestion: AdQuestion = {
      id: `q_${Date.now()}_3`,
      question: adData.feedbackQuestionTitle,
      options: [], // No options for feedback question
      correctAnswer: 0, // Not applicable for feedback
      reward: rewardPerQuestion,
      type: 'feedback'
    };

    const allQuestions = [...customQuestions, feedbackQuestion];

    const newAd: Omit<Ad, 'id'> = {
      title: adData.title,
      description: adData.description,
      companyName: adData.companyName, // ✅ FIX: Now properly storing company name
      videoUrl: '', // Will be updated after file upload
      previewImage: '', // Will be updated after file upload
      questions: allQuestions,
      totalReward: Number(adData.totalReward.toFixed(2)), // ✅ FIX: Ensure decimal precision
      rewardPerQuestion,
      isActive: true,
      isPaused: false,
      createdBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalViews: 0,
      totalCompletions: 0
    };

    const docRef = await addDoc(collection(db, ADS_COLLECTION), newAd);
    return docRef.id;
  } catch (error) {
    console.error('Error creating ad:', error);
    throw new Error('Failed to create ad');
  }
};

export const updateAd = async (adId: string, updateData: Partial<AdCreationData>): Promise<void> => {
  try {
    const adRef = doc(db, ADS_COLLECTION, adId);
    const updatePayload: any = {
      ...updateData,
      updatedAt: new Date()
    };

    // Recalculate rewards if questions or total reward changed
    if (updateData.questions || updateData.totalReward) {
      const currentAd = await getAdById(adId);
      if (currentAd) {
        const questions = updateData.questions || currentAd.questions;
        const totalReward = updateData.totalReward || currentAd.totalReward;
        const rewardPerQuestion = totalReward / questions.length;
        
        updatePayload.rewardPerQuestion = rewardPerQuestion;
        if (updateData.questions) {
          updatePayload.questions = questions.map((q, index) => ({
            ...q,
            id: `q_${Date.now()}_${index}`,
            reward: rewardPerQuestion
          }));
        }
      }
    }

    await updateDoc(adRef, updatePayload);
  } catch (error) {
    console.error('Error updating ad:', error);
    throw new Error('Failed to update ad');
  }
};

export const deleteAd = async (adId: string): Promise<void> => {
  try {
    const adRef = doc(db, ADS_COLLECTION, adId);
    await deleteDoc(adRef);
    
    // Also delete all user interactions with this ad
    // Note: In production, you might want to keep this data for analytics
    const interactionsQuery = query(
      collection(db, USER_AD_INTERACTIONS_COLLECTION),
      where('adId', '==', adId)
    );
    const interactionsSnapshot = await getDocs(interactionsQuery);
    
    const batch = writeBatch(db);
    interactionsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  } catch (error) {
    console.error('Error deleting ad:', error);
    throw new Error('Failed to delete ad');
  }
};

export const toggleAdStatus = async (adId: string): Promise<void> => {
  try {
    const adRef = doc(db, ADS_COLLECTION, adId);
    const adDoc = await getDoc(adRef);
    
    if (!adDoc.exists()) {
      throw new Error('Ad not found');
    }
    
    const currentAd = adDoc.data() as Ad;
    await updateDoc(adRef, {
      isActive: !currentAd.isActive,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error toggling ad status:', error);
    throw new Error('Failed to toggle ad status');
  }
};

export const toggleAdPause = async (adId: string): Promise<void> => {
  try {
    const adRef = doc(db, ADS_COLLECTION, adId);
    const adDoc = await getDoc(adRef);
    
    if (!adDoc.exists()) {
      throw new Error('Ad not found');
    }
    
    const currentAd = adDoc.data() as Ad;
    await updateDoc(adRef, {
      isPaused: !currentAd.isPaused,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error toggling ad pause:', error);
    throw new Error('Failed to toggle ad pause');
  }
};

export const getAllAds = async (): Promise<Ad[]> => {
  try {
    const adsRef = collection(db, ADS_COLLECTION);
    const adsQuery = query(adsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(adsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Ad));
  } catch (error) {
    console.error('Error fetching ads:', error);
    throw new Error('Failed to fetch ads');
  }
};

export const getAdById = async (adId: string): Promise<Ad | null> => {
  try {
    const adRef = doc(db, ADS_COLLECTION, adId);
    const adDoc = await getDoc(adRef);
    
    if (!adDoc.exists()) {
      return null;
    }
    
    return {
      id: adDoc.id,
      ...adDoc.data()
    } as Ad;
  } catch (error) {
    console.error('Error fetching ad:', error);
    throw new Error('Failed to fetch ad');
  }
};

// Helper function to convert Firestore timestamp to Date
const convertFirestoreTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it's a Firestore Timestamp
  if (timestamp.seconds && timestamp.nanoseconds !== undefined) {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  }
  
  // If it's a string, try to parse it
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  
  // Fallback
  return new Date();
};

export const getAdViewers = async (adId: string) => {
  try {
    // Get all user interactions for this ad
    const interactionsQuery = query(
      collection(db, USER_AD_INTERACTIONS_COLLECTION),
      where('adId', '==', adId),
      where('isCompleted', '==', true)
    );
    
    const interactionsSnapshot = await getDocs(interactionsQuery);
    const viewers = [];
    
    for (const interactionDoc of interactionsSnapshot.docs) {
      const interaction = interactionDoc.data() as UserAdInteraction;
      
      // Get user profile data
      const userProfileRef = doc(db, 'userProfile', interaction.userId);
      const userProfileDoc = await getDoc(userProfileRef);
      
      if (userProfileDoc.exists()) {
        const userProfile = userProfileDoc.data();
        
        // Calculate correct answers
        const correctAnswers = interaction.questionsAnswered.filter(q => q.isCorrect).length;
        
        viewers.push({
          userId: interaction.userId,
          name: userProfile.name || 'N/A',
          email: userProfile.email || 'N/A',
          phone: userProfile.phone || 'N/A',
          country: userProfile.country || 'N/A',
          city: userProfile.city || 'N/A',
          correctAnswers: correctAnswers,
          totalQuestions: interaction.questionsAnswered.length,
          earnedAmount: interaction.totalEarned,
          watchedAt: convertFirestoreTimestamp(interaction.watchedAt),
          completedAt: interaction.completedAt ? convertFirestoreTimestamp(interaction.completedAt) : undefined
        });
      }
    }
    
    return viewers;
  } catch (error) {
    console.error('Error getting ad viewers:', error);
    throw error;
  }
};

export const getAdAnalytics = async (adId: string) => {
  try {
    const ad = await getAdById(adId);
    if (!ad) return null;
    
    const viewers = await getAdViewers(adId);
    
    return {
      adId: adId,
      totalViews: ad.totalViews,
      totalCompletions: ad.totalCompletions,
      totalEarningsDistributed: viewers.reduce((sum, viewer) => sum + viewer.earnedAmount, 0),
      averageScore: viewers.length > 0 ? 
        (viewers.reduce((sum, viewer) => sum + (viewer.correctAnswers / viewer.totalQuestions) * 100, 0) / viewers.length) : 0,
      viewerDetails: viewers,
      companyName: ad.companyName,
      adTitle: ad.title,
      createdAt: convertFirestoreTimestamp(ad.createdAt)
    };
  } catch (error) {
    console.error('Error getting ad analytics:', error);
    throw error;
  }
};

/**
 * User Functions - Watch ads, answer questions, track earnings
 */

/**
 * User Functions - Watch Ads and Submit Answers
 */

export const watchAd = async (
  userId: string, 
  adId: string, 
  answers: { questionId: string; selectedAnswer?: number; textAnswer?: string; }[],
  userDetails?: { email: string; phone?: string; address?: string; }
): Promise<{ earnedAmount: number; interactionId: string; }> => {
  try {
    // ✅ FIX: Check if user already completed this ad to prevent duplicates
    const hasCompleted = await hasUserCompletedAd(userId, adId);
    if (hasCompleted) {
      throw new Error('You have already completed this ad');
    }

    // Get the ad to calculate rewards
    const ad = await getAdById(adId);
    if (!ad) {
      throw new Error('Ad not found');
    }

    if (!ad.isActive || ad.isPaused) {
      throw new Error('This ad is no longer available');
    }

    // ✅ FIX: Create interaction record first but don't mark as completed yet
    const interaction: Omit<UserAdInteraction, 'id'> = {
      userId,
      adId,
      watchedAt: new Date(),
      questionsAnswered: [],
      totalEarned: 0,
      isCompleted: false
    };

    const interactionRef = await addDoc(collection(db, USER_AD_INTERACTIONS_COLLECTION), interaction);
    const interactionId = interactionRef.id;

    let totalEarned = 0;
    let questionsAnswered = 0;
    let correctAnswers = 0;
    const answersData = [];

    // Process answers and calculate rewards
    for (const answer of answers) {
      const question = ad.questions.find(q => q.id === answer.questionId);
      if (question) {
        questionsAnswered++;
        
        // Determine if answer is correct and calculate reward
        let isCorrect = false;
        let earnedReward = 0;
        
        if (question.type === 'multiple-choice' && answer.selectedAnswer === question.correctAnswer) {
          isCorrect = true;
          earnedReward = question.reward;
          correctAnswers++;
        } else if (question.type === 'feedback' && answer.textAnswer?.trim()) {
          // Feedback questions always give reward if answered
          isCorrect = true; // Consider feedback as "correct" for completion
          earnedReward = question.reward;
          correctAnswers++;
        }
        
        totalEarned += earnedReward;
        
        answersData.push({
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer || 0,
          textAnswer: answer.textAnswer || '',
          isCorrect,
          earnedReward
        });
      }
    }

    // ✅ FIX: Update interaction with all data at once and mark as completed
    const updateData: any = {
      questionsAnswered: answersData,
      totalEarned,
      completedAt: new Date(),
      isCompleted: true
    };
    
    if (userDetails) {
      updateData.userDetails = userDetails;
    }
    
    await updateDoc(interactionRef, updateData);

    // ✅ FIX: Update ad analytics (views + completion)
    const adRef = doc(db, ADS_COLLECTION, adId);
    const adDoc = await getDoc(adRef);
    if (adDoc.exists()) {
      const currentViews = adDoc.data().totalViews || 0;
      const currentCompletions = adDoc.data().totalCompletions || 0;
      await updateDoc(adRef, {
        totalViews: currentViews + 1,
        totalCompletions: currentCompletions + 1
      });
    }

    // ✅ NEW: Update centralized user earnings
    if (totalEarned > 0) {
      await addAdsEarnings(userId, totalEarned);
    }

    // ✅ FIX: Update user ad stats (total ads watched, daily count)
    await updateUserAdStats(userId);

    // ✅ FIX: Update daily activity
    const today = new Date().toISOString().split('T')[0];
    await updateUserDailyActivity(userId, today, 1, totalEarned, questionsAnswered, correctAnswers);

    return { earnedAmount: totalEarned, interactionId };
  } catch (error) {
    console.error('Error watching ad:', error);
    throw error;
  }
};

/**
 * Check if user has completed a specific ad
 */
export const hasUserCompletedAd = async (userId: string, adId: string): Promise<boolean> => {
  try {
    const interactionsQuery = query(
      collection(db, USER_AD_INTERACTIONS_COLLECTION),
      where('userId', '==', userId),
      where('adId', '==', adId),
      where('isCompleted', '==', true)
    );
    
    const snapshot = await getDocs(interactionsQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking if user completed ad:', error);
    return false;
  }
};

/**
 * Get all completed ad IDs for a user
 */
export const getUserCompletedAdIds = async (userId: string): Promise<string[]> => {
  try {
    const interactionsQuery = query(
      collection(db, USER_AD_INTERACTIONS_COLLECTION),
      where('userId', '==', userId),
      where('isCompleted', '==', true)
    );
    
    const snapshot = await getDocs(interactionsQuery);
    return snapshot.docs.map(doc => doc.data().adId);
  } catch (error) {
    console.error('Error getting user completed ads:', error);
    return [];
  }
};

export const getAvailableAdsForUser = async (userId: string): Promise<Ad[]> => {
  try {
    // Get all active and non-paused ads
    const adsRef = collection(db, ADS_COLLECTION);
    const adsQuery = query(
      adsRef, 
      where('isActive', '==', true),
      where('isPaused', '==', false)
    );
    const adsSnapshot = await getDocs(adsQuery);
    const allAds = adsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Ad));

    // Get user's completed ad interactions to filter out already watched ads
    const interactionsQuery = query(
      collection(db, USER_AD_INTERACTIONS_COLLECTION),
      where('userId', '==', userId),
      where('isCompleted', '==', true)
    );
    const interactionsSnapshot = await getDocs(interactionsQuery);
    const watchedAdIds = new Set(
      interactionsSnapshot.docs
        .map(doc => doc.data() as UserAdInteraction)
        .map(interaction => interaction.adId)
    );

    // Get user's daily watch count
    const today = new Date().toISOString().split('T')[0];
    const dailyActivity = await getUserDailyActivity(userId, today);
    
    // Filter ads based on user's watch history and daily limits
    return allAds.filter(ad => {
      // ✅ FIX: Users can't watch the same ad twice (one-time completion)
      if (watchedAdIds.has(ad.id)) {
        return false;
      }
      
      // Check daily watch limit (global limit of 50 ads per day)
      if (dailyActivity && dailyActivity.adsWatched >= 50) {
        return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error fetching available ads:', error);
    throw new Error('Failed to fetch available ads');
  }
};

export const startAdInteraction = async (userId: string, adId: string): Promise<string> => {
  try {
    // ✅ This function is now only used internally by watchAd function
    // to prevent duplicate interactions
    const interaction: Omit<UserAdInteraction, 'id'> = {
      userId,
      adId,
      watchedAt: new Date(),
      questionsAnswered: [],
      totalEarned: 0,
      isCompleted: false
    };

    const docRef = await addDoc(collection(db, USER_AD_INTERACTIONS_COLLECTION), interaction);
    return docRef.id;
  } catch (error) {
    console.error('Error starting ad interaction:', error);
    throw new Error('Failed to start ad interaction');
  }
};

// ✅ Removed submitAdAnswer function to prevent duplicate processing
// All answer submission logic is now handled directly in the watchAd function

// ✅ Removed completeAdInteraction function to prevent duplicate processing
// All completion logic is now handled directly in the watchAd function

/**
 * User Statistics Functions
 */

export const getUserAdStats = async (userId: string): Promise<UserAdStats | null> => {
  try {
    const statsRef = doc(db, USER_AD_STATS_COLLECTION, userId);
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      // Create initial stats
      const initialStats: UserAdStats = {
        userId,
        totalAdsWatched: 0,
        dailyWatchCount: 0,
        todaysCount: 0, // Alias for compatibility
        lastWatchDate: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        lastUpdatedAt: new Date()
      };
      await setDoc(statsRef, initialStats);
      return initialStats;
    }
    
    const data = statsDoc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      lastUpdatedAt: data.lastUpdatedAt?.toDate ? data.lastUpdatedAt.toDate() : new Date(data.lastUpdatedAt)
    } as UserAdStats;
  } catch (error) {
    console.error('Error fetching user ad stats:', error);
    throw new Error('Failed to fetch user ad stats');
  }
};

export const updateUserAdStats = async (userId: string): Promise<void> => {
  try {
    const statsRef = doc(db, USER_AD_STATS_COLLECTION, userId);
    const statsDoc = await getDoc(statsRef);
    const today = new Date().toISOString().split('T')[0];
    
    if (!statsDoc.exists()) {
      const newStats: UserAdStats = {
        userId,
        totalAdsWatched: 1,
        dailyWatchCount: 1,
        todaysCount: 1, // Alias for compatibility
        lastWatchDate: today,
        createdAt: new Date(),
        lastUpdatedAt: new Date()
      };
      await setDoc(statsRef, newStats);
    } else {
      const currentStats = statsDoc.data() as UserAdStats;
      const isNewDay = currentStats.lastWatchDate !== today;
      
      await updateDoc(statsRef, {
        totalAdsWatched: currentStats.totalAdsWatched + 1,
        dailyWatchCount: isNewDay ? 1 : currentStats.dailyWatchCount + 1,
        todaysCount: isNewDay ? 1 : (currentStats.todaysCount || currentStats.dailyWatchCount) + 1,
        lastWatchDate: today,
        lastUpdatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating user ad stats:', error);
    throw new Error('Failed to update user ad stats');
  }
};

export const getUserDailyActivity = async (userId: string, date: string): Promise<UserDailyActivity | null> => {
  try {
    const activityRef = doc(db, USER_DAILY_ACTIVITIES_COLLECTION, `${userId}_${date}`);
    const activityDoc = await getDoc(activityRef);
    
    if (!activityDoc.exists()) {
      return null;
    }
    
    return activityDoc.data() as UserDailyActivity;
  } catch (error) {
    console.error('Error fetching user daily activity:', error);
    throw new Error('Failed to fetch user daily activity');
  }
};

export const updateUserDailyActivity = async (
  userId: string, 
  date: string, 
  adsWatched: number, 
  earnings: number,
  questionsAnswered: number,
  correctAnswers: number
): Promise<void> => {
  try {
    const activityId = `${userId}_${date}`;
    const activityRef = doc(db, USER_DAILY_ACTIVITIES_COLLECTION, activityId);
    const activityDoc = await getDoc(activityRef);
    
    if (!activityDoc.exists()) {
      const newActivity: UserDailyActivity = {
        id: activityId,
        userId,
        date,
        adsWatched,
        earningsToday: earnings,
        questionsAnswered,
        correctAnswers
      };
      await setDoc(activityRef, newActivity);
    } else {
      const currentActivity = activityDoc.data() as UserDailyActivity;
      await updateDoc(activityRef, {
        adsWatched: currentActivity.adsWatched + adsWatched,
        earningsToday: currentActivity.earningsToday + earnings,
        questionsAnswered: currentActivity.questionsAnswered + questionsAnswered,
        correctAnswers: currentActivity.correctAnswers + correctAnswers
      });
    }
  } catch (error) {
    console.error('Error updating user daily activity:', error);
    throw new Error('Failed to update user daily activity');
  }
};

/**
 * File handling functions (for local storage since no Firebase Storage subscription)
 */

export const saveVideoToLocal = async (file: File, adId: string): Promise<string> => {
  try {
    // For client-side development, we'll handle this with file utilities
    const { saveFileToPublic } = await import('../../utils/fileHandler');
    const result = await saveFileToPublic(file, 'videos', adId);
    
    if (result.success) {
      return result.filePath;
    } else {
      throw new Error(result.error || 'Failed to save video file');
    }
  } catch (error) {
    console.error('Error saving video file:', error);
    // Fallback to temporary URL
    const fileName = `ad_${adId}_video.${file.name.split('.').pop()}`;
    return `/assets/ads/videos/${fileName}`;
  }
};

export const saveImageToLocal = async (file: File, adId: string): Promise<string> => {
  try {
    // For client-side development, we'll handle this with file utilities
    const { saveFileToPublic } = await import('../../utils/fileHandler');
    const result = await saveFileToPublic(file, 'images', adId);
    
    if (result.success) {
      return result.filePath;
    } else {
      throw new Error(result.error || 'Failed to save image file');
    }
  } catch (error) {
    console.error('Error saving image file:', error);
    // Fallback to temporary URL
    const fileName = `ad_${adId}_preview.${file.name.split('.').pop()}`;
    return `/assets/ads/images/${fileName}`;
  }
};

// Firebase Storage upload functions
export const uploadVideoToFirebase = async (file: File, adId: string): Promise<string> => {
  try {
    const fileName = `ads/${adId}/video.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading video to Firebase Storage:', error);
    throw new Error('Failed to upload video');
  }
};

export const uploadImageToFirebase = async (file: File, adId: string): Promise<string> => {
  try {
    const fileName = `ads/${adId}/preview.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error);
    throw new Error('Failed to upload image');
  }
};
