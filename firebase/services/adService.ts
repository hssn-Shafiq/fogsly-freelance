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
    const rewardPerQuestion = adData.totalReward / 4; // 4 total questions (3 custom + 1 feedback)
    
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
      videoUrl: '', // Will be updated after file upload
      previewImage: '', // Will be updated after file upload
      questions: allQuestions,
      totalReward: adData.totalReward,
      rewardPerQuestion,
      isActive: true,
      isPaused: false,
      isOneTimePerUser: adData.isOneTimePerUser,
      maxDailyViews: adData.maxDailyViews,
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
    // Start the interaction
    const interactionId = await startAdInteraction(userId, adId);
    
    // Get the ad to calculate rewards
    const ad = await getAdById(adId);
    if (!ad) {
      throw new Error('Ad not found');
    }
    
    let totalEarned = 0;
    let questionsAnswered = 0;
    let correctAnswers = 0;
    
    // Submit answers and calculate rewards
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
        
        await submitAdAnswer(
          interactionId, 
          answer.questionId, 
          answer.selectedAnswer || 0, 
          isCorrect,
          earnedReward
        );
      }
    }
    
    // Complete the interaction
    await completeAdInteraction(interactionId, userDetails);
    
    // Update user stats
    await updateUserAdStats(userId, totalEarned);
    
    // Update daily activity
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

    // Get user's ad interactions to filter out one-time ads already watched
    const interactionsQuery = query(
      collection(db, USER_AD_INTERACTIONS_COLLECTION),
      where('userId', '==', userId)
    );
    const interactionsSnapshot = await getDocs(interactionsQuery);
    const watchedAdIds = new Set(
      interactionsSnapshot.docs
        .map(doc => doc.data() as UserAdInteraction)
        .filter(interaction => interaction.isCompleted)
        .map(interaction => interaction.adId)
    );

    // Get user's daily watch count
    const userStats = await getUserAdStats(userId);
    const today = new Date().toISOString().split('T')[0];
    const dailyActivity = await getUserDailyActivity(userId, today);
    
    // Filter ads based on user's watch history and daily limits
    return allAds.filter(ad => {
      // If it's a one-time ad and user has already watched it
      if (ad.isOneTimePerUser && watchedAdIds.has(ad.id)) {
        return false;
      }
      
      // Check daily watch limit for this specific ad
      if (!ad.isOneTimePerUser && dailyActivity) {
        // This is simplified - in a real app, you'd track per-ad daily counts
        const totalDailyWatches = dailyActivity.adsWatched;
        if (totalDailyWatches >= 50) { // Global daily limit
          return false;
        }
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
    const interaction: Omit<UserAdInteraction, 'id'> = {
      userId,
      adId,
      watchedAt: new Date(),
      questionsAnswered: [],
      totalEarned: 0,
      isCompleted: false
    };

    const docRef = await addDoc(collection(db, USER_AD_INTERACTIONS_COLLECTION), interaction);
    
    // Update ad view count
    const adRef = doc(db, ADS_COLLECTION, adId);
    const adDoc = await getDoc(adRef);
    if (adDoc.exists()) {
      const currentViews = adDoc.data().totalViews || 0;
      await updateDoc(adRef, {
        totalViews: currentViews + 1
      });
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error starting ad interaction:', error);
    throw new Error('Failed to start ad interaction');
  }
};

export const submitAdAnswer = async (
  interactionId: string, 
  questionId: string, 
  selectedAnswer: number,
  isCorrect: boolean,
  earnedReward: number
): Promise<void> => {
  try {
    const interactionRef = doc(db, USER_AD_INTERACTIONS_COLLECTION, interactionId);
    const interactionDoc = await getDoc(interactionRef);
    
    if (!interactionDoc.exists()) {
      throw new Error('Interaction not found');
    }
    
    const interaction = interactionDoc.data() as UserAdInteraction;
    const updatedAnswers = [...interaction.questionsAnswered, {
      questionId,
      selectedAnswer,
      isCorrect,
      earnedReward
    }];
    
    await updateDoc(interactionRef, {
      questionsAnswered: updatedAnswers,
      totalEarned: interaction.totalEarned + earnedReward
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    throw new Error('Failed to submit answer');
  }
};

export const completeAdInteraction = async (
  interactionId: string, 
  userDetails?: { email: string; phone?: string; address?: string; }
): Promise<void> => {
  try {
    const interactionRef = doc(db, USER_AD_INTERACTIONS_COLLECTION, interactionId);
    const interactionDoc = await getDoc(interactionRef);
    
    if (!interactionDoc.exists()) {
      throw new Error('Interaction not found');
    }
    
    const interaction = interactionDoc.data() as UserAdInteraction;
    
    // Mark interaction as completed
    const updateData: any = {
      completedAt: new Date(),
      isCompleted: true
    };
    
    // Add user details if provided
    if (userDetails) {
      updateData.userDetails = userDetails;
    }
    
    await updateDoc(interactionRef, updateData);
    
    // Update ad completion count
    const adRef = doc(db, ADS_COLLECTION, interaction.adId);
    const adDoc = await getDoc(adRef);
    if (adDoc.exists()) {
      const currentCompletions = adDoc.data().totalCompletions || 0;
      await updateDoc(adRef, {
        totalCompletions: currentCompletions + 1
      });
    }
    
    // Update user stats
    await updateUserAdStats(interaction.userId, interaction.totalEarned);
    
    // Update daily activity
    const today = new Date().toISOString().split('T')[0];
    await updateUserDailyActivity(
      interaction.userId, 
      today, 
      1, 
      interaction.totalEarned, 
      interaction.questionsAnswered.length,
      interaction.questionsAnswered.filter(q => q.isCorrect).length
    );
  } catch (error) {
    console.error('Error completing ad interaction:', error);
    throw new Error('Failed to complete ad interaction');
  }
};

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
        totalEarnings: 0,
        totalEarned: 0, // Alias for compatibility
        dailyWatchCount: 0,
        todaysCount: 0, // Alias for compatibility
        lastWatchDate: new Date().toISOString().split('T')[0],
        availableBalance: 0,
        withdrawnAmount: 0
      };
      // Use setDoc to create the document if it doesn't exist
      await setDoc(statsRef, initialStats, { merge: true });
      return initialStats;
    }
    return statsDoc.data() as UserAdStats;
  } catch (error) {
    console.error('Error fetching user ad stats:', error);
    throw new Error('Failed to fetch user ad stats');
  }
};

export const updateUserAdStats = async (userId: string, earnedAmount: number): Promise<void> => {
  try {
    const statsRef = doc(db, USER_AD_STATS_COLLECTION, userId);
    const statsDoc = await getDoc(statsRef);
    const today = new Date().toISOString().split('T')[0];
    
    if (!statsDoc.exists()) {
      const newStats: UserAdStats = {
        userId,
        totalAdsWatched: 1,
        totalEarnings: earnedAmount,
        totalEarned: earnedAmount, // Alias for compatibility
        dailyWatchCount: 1,
        todaysCount: 1, // Alias for compatibility
        lastWatchDate: today,
        availableBalance: earnedAmount,
        withdrawnAmount: 0
      };
      // Use setDoc to create the document if it doesn't exist
      await setDoc(statsRef, newStats, { merge: true });
    } else {
      const currentStats = statsDoc.data() as UserAdStats;
      const isNewDay = currentStats.lastWatchDate !== today;
      await updateDoc(statsRef, {
        totalAdsWatched: currentStats.totalAdsWatched + 1,
        totalEarnings: currentStats.totalEarnings + earnedAmount,
        dailyWatchCount: isNewDay ? 1 : currentStats.dailyWatchCount + 1,
        lastWatchDate: today,
        availableBalance: currentStats.availableBalance + earnedAmount
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
