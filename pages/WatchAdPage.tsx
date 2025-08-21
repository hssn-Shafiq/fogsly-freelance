import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../firebase/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RadioGroup } from '../components/ui/RadioGroup';
import { Textarea } from '../components/ui/Textarea';
import { 
  getAvailableAdsForUser, 
  getUserAdStats, 
  getUserCompletedAdIds,
  watchAd 
} from '../firebase/services/adService';
import { getUserProfile } from '../firebase/services/userService';
import { Ad, UserAdStats } from '../firebase/types/ads';
import { UserProfile } from '../firebase/types/user';
import { Route } from '../types';
import { toast } from 'react-hot-toast';
import { 
  Play, 
  Clock, 
  DollarSign, 
  Eye, 
  TrendingUp, 
  Award, 
  Check, 
  Gift,
  ArrowLeft,
  User,
  Pause
} from 'lucide-react';

interface AdCardProps {
  ad: Ad;
  isCompleted: boolean;
  onWatch: (ad: Ad) => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, isCompleted, onWatch }) => {
  return (
    <motion.div whileHover={{ y: isCompleted ? 0 : -5 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Card
        className={`cursor-pointer overflow-hidden h-full flex flex-col transition-shadow ${
          isCompleted ? 'opacity-75' : 'hover:shadow-lg'
        }`}
        onClick={() => !isCompleted && onWatch(ad)}
      >
        <div className="relative bg-[--color-bg-tertiary] aspect-video flex items-center justify-center">
          {isCompleted ? (
            <div className="absolute inset-0 bg-green-500/90 flex flex-col items-center justify-center backdrop-blur-[2px]">
              <Check className="w-12 h-12 text-white bg-green-600 rounded-full p-2 mb-2" />
              <span className="text-white font-semibold text-lg">Completed</span>
            </div>
          ) : null}
          
          {ad.previewImage ? (
            <img
              src={ad.previewImage}
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-100 to-purple-100">
              <Play className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          {!isCompleted && (
            <>
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                <Clock className="w-3 h-3" />
                <span>30s</span>
              </div>
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                <DollarSign className="w-3 h-3" />
                <span>{ad.totalReward} FOG</span>
              </div>
            </>
          )}
        </div>
        
        <CardHeader>
          <CardTitle className="text-lg">{ad.title}</CardTitle>
          <CardDescription>{ad.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow">
          {isCompleted ? (
            <div className="text-sm font-medium text-green-600 flex items-center">
              <Check className="w-4 h-4 mr-2" /> 
              Completed
            </div>
          ) : (
            <div className="flex justify-between items-center text-sm text-[--color-text-secondary]">
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                {ad.questions.length} questions
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {ad.totalViews || 0} views
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

type WatchPhase = 'list' | 'video' | 'questions' | 'thankyou';

const WatchAdPage: React.FC<{ navigate: (route: Route) => void }> = ({ navigate }) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // State management
  const [ads, setAds] = useState<Ad[]>([]);
  const [completedAdIds, setCompletedAdIds] = useState<string[]>([]);
  const [userStats, setUserStats] = useState<UserAdStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Ad watching state
  const [phase, setPhase] = useState<WatchPhase>('list');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedAnswer?: number; textAnswer?: string; }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);
  
  // Video player state
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [availableAds, stats, profile, completedIds] = await Promise.all([
        getAvailableAdsForUser(user.uid),
        getUserAdStats(user.uid),
        getUserProfile(user.uid),
        getUserCompletedAdIds(user.uid)
      ]);

      setAds(availableAds);
      setUserStats(stats);
      setUserProfile(profile);
      setCompletedAdIds(completedIds);
    } catch (error) {
      console.error('Error loading ads data:', error);
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchAd = (ad: Ad) => {
    console.log('Opening ad for watching:', ad);
    console.log('Ad video URL:', ad.videoUrl);
    console.log('Ad preview image:', ad.previewImage);
    
    setSelectedAd(ad);
    setPhase('video');
    setVideoEnded(false);
    setCurrentQuestionIndex(0);
    setAnswers(ad.questions.map(q => ({ questionId: q.id })));
    setVideoProgress(0);
    setVideoCurrentTime(0);
    setVideoDuration(0);
    setIsVideoPlaying(false);
  };

  const handleVideoEnded = () => {
    setVideoEnded(true);
    setIsVideoPlaying(false);
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setVideoCurrentTime(currentTime);
      if (duration) {
        setVideoProgress((currentTime / duration) * 100);
      }
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      console.log('Video metadata loaded, duration:', videoRef.current.duration);
      // Auto play after metadata loads
      videoRef.current.play().catch(error => {
        console.log('Auto-play prevented by browser:', error);
        // This is normal - browsers often prevent auto-play
      });
    }
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startQuestions = () => {
    setPhase('questions');
  };

  const handleAnswerChange = (questionId: string, value: string | number, isTextAnswer: boolean = false) => {
    setAnswers(prev => prev.map(answer => 
      answer.questionId === questionId 
        ? { 
            ...answer, 
            [isTextAnswer ? 'textAnswer' : 'selectedAnswer']: value,
          }
        : answer
    ));
  };

  const nextQuestion = () => {
    if (selectedAd && currentQuestionIndex < selectedAd.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitAnswers();
    }
  };

  const submitAnswers = async () => {
    if (!selectedAd || !user) return;

    setIsSubmitting(true);
    try {
      const result = await watchAd(user.uid, selectedAd.id, answers);
      setEarnedAmount(result.earnedAmount);
      setPhase('thankyou');
      toast.success(`Great! You earned ${result.earnedAmount} FOG coins!`);
      
      // Add this ad to completed list
      setCompletedAdIds(prev => [...prev, selectedAd.id]);
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error('Failed to submit answers. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBackToList = () => {
    setPhase('list');
    setSelectedAd(null);
    loadData(); // Refresh data
  };

  const goToProfile = () => {
    navigate('profile');
  };

  const replacePlaceholders = (text: string): string => {
    if (!userProfile) return text;
    
    return text
      .replace(/\{userName\}/g, userProfile.name || userProfile.displayName || 'User')
      .replace(/\{userAge\}/g, userProfile.age?.toString() || 'N/A')
      .replace(/\{userLocation\}/g, userProfile.city && userProfile.country ? `${userProfile.city}, ${userProfile.country}` : 'N/A');
  };

  // Get current question and answer
  const currentQuestion = selectedAd?.questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  const isCurrentQuestionAnswered = currentAnswer && 
    (currentAnswer.selectedAnswer !== undefined || currentAnswer.textAnswer?.trim());

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--color-bg-primary]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[--color-text-primary] mb-4">Please Login</h2>
          <p className="text-[--color-text-secondary] mb-6">You need to be logged in to watch ads and earn rewards.</p>
          <Button onClick={() => navigate('auth')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Render different phases
  if (phase === 'video' && selectedAd) {
    return (
      <div className="min-h-screen bg-[--color-bg-primary] py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-[--color-bg-secondary] rounded-lg overflow-hidden shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[--color-border]">
              <Button variant="outline" onClick={goBackToList} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Ads
              </Button>
              <h2 className="text-lg font-semibold text-[--color-text-primary]">{selectedAd.title}</h2>
              <div className="flex items-center gap-2 text-sm text-[--color-text-secondary]">
                <Gift className="w-4 h-4" />
                {selectedAd.totalReward} FOG Coins
              </div>
            </div>

            {/* Video Section */}
            <div className="p-6">
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative">
                {selectedAd.videoUrl ? (
                  <>
                    <video
                      ref={videoRef}
                      src={selectedAd.videoUrl}
                      className="w-full h-full object-cover"
                      controls={false}
                      preload="metadata"
                      onEnded={handleVideoEnded}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onLoadedMetadata={handleVideoLoadedMetadata}
                      onPlay={handleVideoPlay}
                      onPause={handleVideoPause}
                      onLoadStart={() => console.log('Video load started')}
                      onCanPlay={() => console.log('Video can play')}
                      onError={(e) => {
                        console.error('Video error:', e);
                        console.log('Video URL:', selectedAd.videoUrl);
                        const video = e.target as HTMLVideoElement;
                        console.log('Video error details:', video.error);
                        toast.error('Error loading video. Please try again.');
                        // Set video ended to allow proceeding
                        setVideoEnded(true);
                      }}
                    />
                    
                    {/* Play Button Overlay */}
                    {!isVideoPlaying && !videoEnded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Button
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.play().catch(error => {
                                console.error('Error playing video:', error);
                                toast.error('Unable to play video automatically. Please check your media permissions.');
                              });
                            }
                          }}
                          className="bg-white/90 hover:bg-white text-black rounded-full p-4"
                        >
                          <Play className="w-8 h-8" />
                        </Button>
                      </div>
                    )}
                    
                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      {/* Progress Bar */}
                      <div className="bg-black/50 rounded-lg p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-white text-sm font-medium">
                            {isVideoPlaying ? (
                              <div className="flex items-center gap-1">
                                <Pause className="w-3 h-3" />
                                Playing
                              </div>
                            ) : videoEnded ? (
                              <div className="flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Completed
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Play className="w-3 h-3" />
                                Paused
                              </div>
                            )}
                          </span>
                          <div className="flex-1 bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                              style={{ width: `${videoProgress}%` }}
                            />
                          </div>
                          <span className="text-white text-sm">
                            {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                          </span>
                        </div>
                        
                        {!videoEnded && (
                          <div className="text-center">
                            <p className="text-white/80 text-sm">
                              Watch the complete video to continue
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No video available</p>
                      <Button onClick={() => setVideoEnded(true)} className="mt-4">
                        Continue to Questions
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {selectedAd.description && (
                <p className="text-[--color-text-secondary] mb-4">{selectedAd.description}</p>
              )}

              {videoEnded ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <Button onClick={startQuestions} className="px-8 py-3">
                    Start Questions
                  </Button>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center text-[--color-text-secondary]">
                  <Clock className="w-4 h-4 mr-2" />
                  Please watch the content completely to continue
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'questions' && selectedAd && currentQuestion) {
    return (
      <div className="min-h-screen bg-[--color-bg-primary] py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-[--color-bg-secondary] rounded-lg overflow-hidden shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[--color-border]">
              <Button variant="outline" onClick={goBackToList} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Ads
              </Button>
              <h2 className="text-lg font-semibold text-[--color-text-primary]">{selectedAd.title}</h2>
              <div className="flex items-center gap-2 text-sm text-[--color-text-secondary]">
                <Gift className="w-4 h-4" />
                {selectedAd.totalReward} FOG Coins
              </div>
            </div>

            {/* Progress */}
            <div className="p-6 border-b border-[--color-border]">
              <div className="flex justify-between text-sm text-[--color-text-secondary] mb-2">
                <span>Question {currentQuestionIndex + 1} of {selectedAd.questions.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / selectedAd.questions.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-[--color-bg-tertiary] rounded-full h-2">
                <div 
                  className="bg-[--color-primary] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / selectedAd.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-[--color-text-primary] mb-6">
                {replacePlaceholders(currentQuestion.question)}
              </h3>

              {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                <div className="space-y-3 mb-6">
                  {currentQuestion.options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id={`${currentQuestion.id}_${index}`}
                        name={`question-${currentQuestion.id}`}
                        value={index}
                        checked={currentAnswer?.selectedAnswer === index}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, parseInt(e.target.value))}
                        className="w-4 h-4 text-[--color-primary] border-[--color-border] focus:ring-[--color-primary]"
                      />
                      <label 
                        htmlFor={`${currentQuestion.id}_${index}`}
                        className="text-[--color-text-primary] cursor-pointer flex-1"
                      >
                        {replacePlaceholders(option)}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'feedback' && (
                <div className="mb-6">
                  <Textarea
                    value={currentAnswer?.textAnswer || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value, true)}
                    placeholder="Please provide your feedback..."
                    className="w-full min-h-[100px]"
                    maxLength={500}
                  />
                </div>
              )}

              {/* Next Button */}
              <div className="flex justify-end">
                <Button
                  onClick={nextQuestion}
                  disabled={!isCurrentQuestionAnswered || isSubmitting}
                  className="px-8 py-3"
                >
                  {isSubmitting ? 'Submitting...' : 
                   currentQuestionIndex === selectedAd.questions.length - 1 ? 'Submit Answers' : 'Next Question'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'thankyou') {
    return (
      <div className="min-h-screen bg-[--color-bg-primary] py-6">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[--color-bg-secondary] rounded-lg overflow-hidden shadow-lg p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-[--color-text-primary] mb-4">
              Thank You!
            </h2>
            
            <p className="text-[--color-text-secondary] mb-6">
              You have successfully completed the ad and answered all questions.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <Gift className="w-5 h-5" />
                <span className="font-semibold">You earned {earnedAmount} FOG Coins!</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={goBackToList}>
                Watch More Ads
              </Button>
              <Button onClick={goToProfile} className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Go to Profile
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Default list view
  return (
    <div className="min-h-screen bg-[--color-bg-primary]">
      {/* Header */}
      <div className="bg-[--color-bg-secondary] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[--color-text-primary]">Watch Ads & Earn</h1>
              <p className="text-[--color-text-secondary] mt-1">Complete ads and answer questions to earn FOG coins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-[--color-text-primary]">{userStats?.totalAdsWatched || 0}</p>
                  <p className="text-[--color-text-secondary] text-sm">Ads Watched</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-[--color-text-primary]">{userStats?.totalEarned || 0}</p>
                  <p className="text-[--color-text-secondary] text-sm">Total Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-[--color-text-primary]">{userProfile?.balance || 0}</p>
                  <p className="text-[--color-text-secondary] text-sm">Available Balance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-[--color-text-primary]">{userStats?.todaysCount || 0}</p>
                  <p className="text-[--color-text-secondary] text-sm">Today's Count</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Ads */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[--color-text-primary] mb-6">Available Ads</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[--color-bg-secondary] rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="h-48 bg-[--color-bg-tertiary] rounded-md mb-4"></div>
                  <div className="h-4 bg-[--color-bg-tertiary] rounded mb-2"></div>
                  <div className="h-4 bg-[--color-bg-tertiary] rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-[--color-bg-tertiary] rounded"></div>
                </div>
              ))}
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-[--color-bg-tertiary] rounded-full flex items-center justify-center mb-4">
                <Play className="w-12 h-12 text-[--color-text-secondary]" />
              </div>
              <h3 className="text-xl font-semibold text-[--color-text-primary] mb-2">No Ads Available</h3>
              <p className="text-[--color-text-secondary] mb-4">
                There are no ads available for you to watch right now. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <AdCard 
                  key={ad.id} 
                  ad={ad} 
                  isCompleted={completedAdIds.includes(ad.id)}
                  onWatch={handleWatchAd} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchAdPage;
