import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, DollarSign, Clock, ArrowRight, ChevronLeft, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Textarea } from '../components/ui/Textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';
import { Label } from '../components/ui/Label';

// --- Mock Data ---

const mockUser = {
  id: "user_fogsly_123",
  email: "alex.j@example.com",
  phone: "+1 555-123-4567",
  // IMPORTANT: For security reasons, password is never accessed or used in the frontend.
};

const mockAds = [
  {
    id: 1,
    brand: "CyberSecure",
    title: "Protect Your Digital Life",
    duration: 10, // in seconds
    totalReward: 1.00,
    questions: [
      {
        type: 'mcq',
        text: "What is the main service offered in the ad?",
        options: ["VPN Service", "Antivirus Software", "Password Manager"],
        correctAnswerIndex: 1,
        reward: 0.25,
      },
      {
        type: 'mcq',
        text: "What color was the shield icon?",
        options: ["Red", "Green", "Blue"],
        correctAnswerIndex: 2,
        reward: 0.25,
      },
      {
        type: 'mcq',
        text: "The ad mentions protection against how many types of threats?",
        options: ["Three", "Five", "Countless"],
        correctAnswerIndex: 2,
        reward: 0.25,
      },
      {
        type: 'descriptive',
        text: "Describe the ad's core message and how it made you feel about online security.",
        reward: 0.25,
      },
    ],
  },
  {
    id: 2,
    brand: "EcoWater",
    title: "Pure Water, Pure Life",
    duration: 12,
    totalReward: 1.25,
    questions: [
       {
        type: 'mcq',
        text: "What animal was shown drinking from the river?",
        options: ["A deer", "A bear", "A fox"],
        correctAnswerIndex: 0,
        reward: 0.30,
      },
      {
        type: 'mcq',
        text: "What is the bottle made of?",
        options: ["Recycled Plastic", "Glass", "Stainless Steel"],
        correctAnswerIndex: 0,
        reward: 0.30,
      },
       {
        type: 'mcq',
        text: "What's the slogan at the end of the ad?",
        options: ["Drink Clean", "Hydrate Better", "Pure Water, Pure Life"],
        correctAnswerIndex: 2,
        reward: 0.30,
      },
      {
        type: 'descriptive',
        text: "What aspects of the ad were most memorable to you and why?",
        reward: 0.35,
      },
    ],
  },
];

type Ad = typeof mockAds[0];
type Question = Ad['questions'][0];
type View = 'list' | 'player' | 'questions' | 'summary';

const WatchAdsPage = () => {
  const [view, setView] = useState<View>('list');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [completedAds, setCompletedAds] = useState<number[]>([]);
  
  // State for the ad flow
  const [progress, setProgress] = useState(0);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | number)[]>([]);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [shareEmail, setShareEmail] = useState(true);
  const [sharePhone, setSharePhone] = useState(true);

  // Timer effect for video player simulation
  useEffect(() => {
    if (view === 'player' && selectedAd && progress < 100) {
      const interval = setInterval(() => {
        setProgress(p => {
          const newProgress = p + (100 / selectedAd.duration);
          if (newProgress >= 100) {
            clearInterval(interval);
            setVideoCompleted(true);
            return 100;
          }
          return newProgress;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [view, selectedAd, progress]);

  const resetFlow = () => {
    setProgress(0);
    setVideoCompleted(false);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setEarnedAmount(0);
    setSelectedAd(null);
    setView('list');
    setShareEmail(true);
    setSharePhone(true);
  };
  
  const handleSelectAd = (ad: Ad) => {
    // Allow re-watching completed ads
    setSelectedAd(ad);
    setView('player');
    // Reset states for a fresh run
    setProgress(0);
    setVideoCompleted(false);
    setCurrentQuestionIndex(0);
    setAnswers(new Array(ad.questions.length).fill(''));
    setEarnedAmount(0);
    setShareEmail(true);
    setSharePhone(true);
  };

  const handleNextQuestion = (answer: string | number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);

    const question = selectedAd!.questions[currentQuestionIndex];
    if (question.type === 'mcq') {
      if (answer === question.correctAnswerIndex) {
        setEarnedAmount(prev => prev + question.reward);
      }
    } else {
      // Descriptive question always gives reward
      setEarnedAmount(prev => prev + question.reward);
    }

    if (currentQuestionIndex < selectedAd!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setView('summary');
    }
  };
  
  const handleSubmit = (type: 'submit' | 'save') => {
    const submissionData = {
      action: type,
      userId: mockUser.id,
      userEmail: shareEmail ? mockUser.email : undefined,
      userPhone: sharePhone ? mockUser.phone : undefined,
      adId: selectedAd?.id,
      answers: answers,
      totalEarned: earnedAmount,
      submittedAt: new Date().toISOString(),
    };
    
    console.log("--- FAKE SUBMISSION DATA ---", submissionData);
    alert(`Your response has been ${type === 'submit' ? 'submitted' : 'saved'}. You earned ${earnedAmount.toFixed(2)} FOG Coins!`);

    if (selectedAd && !completedAds.includes(selectedAd.id)) {
      setCompletedAds(prev => [...prev, selectedAd.id]);
    }
    resetFlow();
  };

  const AdCard = ({ ad }: { ad: Ad }) => (
    <motion.div {...{ whileHover: { y: -5 }, transition: { type: 'spring', stiffness: 300 } }}>
      <Card 
        className="cursor-pointer overflow-hidden h-full flex flex-col transition-shadow hover:shadow-lg"
        onClick={() => handleSelectAd(ad)}
      >
        <div className="relative bg-[--color-bg-tertiary] aspect-video flex items-center justify-center">
            <Play className="w-12 h-12 text-[--color-primary]/50" />
            {completedAds.includes(ad.id) && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-[2px]">
                    <Check className="w-10 h-10 text-white bg-green-500 rounded-full p-2" />
                </div>
            )}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                <Clock className="w-3 h-3" />
                <span>{ad.duration}s</span>
            </div>
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                <DollarSign className="w-3 h-3" />
                <span>{ad.totalReward.toFixed(2)} FOG</span>
            </div>
        </div>
        <CardHeader>
          <CardTitle className="text-lg">{ad.brand}</CardTitle>
          <CardDescription>{ad.title}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
            {completedAds.includes(ad.id) && (
                <div className="text-sm font-medium text-green-600 flex items-center">
                    <Check className="w-4 h-4 mr-2"/> Completed
                </div>
            )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderContent = () => {
    switch (view) {
      case 'player':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{selectedAd?.brand}: {selectedAd?.title}</CardTitle>
              <CardDescription>Watch the video completely to proceed.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-[--color-bg-secondary] aspect-video rounded-lg flex items-center justify-center mb-4">
                  <p className="text-[--color-text-secondary]">Video simulation...</p>
              </div>
              <Progress value={progress} />
              {videoCompleted && (
                <motion.div {...{ initial: {opacity: 0}, animate: {opacity: 1} }} className="text-center mt-4">
                    <p className="text-green-600 font-semibold mb-2">Ad completed!</p>
                    <Button onClick={() => setView('questions')}>
                        Start Questions <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        );
      case 'questions':
        const question = selectedAd!.questions[currentQuestionIndex];
        return (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Question {currentQuestionIndex + 1}/{selectedAd!.questions.length}</CardTitle>
                <span className="font-semibold text-[--color-primary]">{earnedAmount.toFixed(2)} FOG Earned</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-medium mb-6 text-lg text-[--color-text-primary]">{question.text}</p>
              {question.type === 'mcq' ? (
                <RadioGroup 
                  value={answers[currentQuestionIndex]?.toString() ?? ''}
                  onValueChange={(val) => {
                    const newAnswers = [...answers];
                    newAnswers[currentQuestionIndex] = parseInt(val);
                    setAnswers(newAnswers);
                  }}
                  className="space-y-3"
                >
                  {question.options.map((option, i) => (
                    <Label key={i} htmlFor={`q${currentQuestionIndex}-o${i}`} className="flex items-center p-3 border border-[--color-border] rounded-md has-[:checked]:bg-[--color-primary]/10 has-[:checked]:border-[--color-primary] cursor-pointer">
                      <RadioGroupItem value={i.toString()} id={`q${currentQuestionIndex}-o${i}`} />
                      <span className="ml-3">{option}</span>
                    </Label>
                  ))}
                </RadioGroup>
              ) : (
                <>
                  <Textarea
                    placeholder="Your detailed thoughts here..."
                    rows={5}
                    value={answers[currentQuestionIndex] as string}
                    onChange={e => {
                      const newAnswers = [...answers];
                      newAnswers[currentQuestionIndex] = e.target.value;
                      setAnswers(newAnswers);
                    }}
                  />
                  <div className="mt-4 space-y-2 p-3 bg-[--color-bg-secondary] rounded-md border border-[--color-border]">
                    <p className="text-xs text-[--color-text-secondary]">
                      Optionally include your contact information with your feedback for {selectedAd?.brand}:
                    </p>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm">
                      <input 
                        type="checkbox" 
                        checked={shareEmail} 
                        onChange={(e) => setShareEmail(e.target.checked)} 
                        className="h-4 w-4 rounded border-[--color-border] bg-[--color-card] text-[--color-primary] focus:ring-2 focus:ring-offset-2 focus:ring-[--color-primary] focus:ring-offset-[--color-bg-secondary]"
                      />
                      <span className="text-[--color-text-secondary]">
                        Share email: <span className="font-medium text-[--color-text-primary]">{mockUser.email}</span>
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm">
                      <input 
                        type="checkbox" 
                        checked={sharePhone} 
                        onChange={(e) => setSharePhone(e.target.checked)} 
                        className="h-4 w-4 rounded border-[--color-border] bg-[--color-card] text-[--color-primary] focus:ring-2 focus:ring-offset-2 focus:ring-[--color-primary] focus:ring-offset-[--color-bg-secondary]"
                      />
                       <span className="text-[--color-text-secondary]">
                        Share phone: <span className="font-medium text-[--color-text-primary]">{mockUser.phone}</span>
                      </span>
                    </label>
                  </div>
                </>
              )}
              <Button 
                className="w-full mt-6" 
                onClick={() => handleNextQuestion(answers[currentQuestionIndex])}
                disabled={answers[currentQuestionIndex] === ''}
              >
                {currentQuestionIndex < selectedAd!.questions.length - 1 ? 'Next Question' : 'Finish'}
              </Button>
            </CardContent>
          </Card>
        );
      case 'summary':
        return (
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Thank You!</CardTitle>
              <CardDescription>You've successfully completed the ad activity.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-[--color-text-secondary]">You earned:</p>
              <p className="text-4xl font-bold text-[--color-primary] my-2">{earnedAmount.toFixed(2)} FOG Coins</p>
              <p className="text-sm text-[--color-text-secondary] mb-6">This amount will be added to your wallet upon submission.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="flex-1" onClick={() => handleSubmit('submit')}>Submit & Post</Button>
                  <Button size="lg" variant="outline" className="flex-1" onClick={() => handleSubmit('save')}>Save & Post Later</Button>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-2">Watch Ads & Earn</h1>
              <p className="text-lg text-[--color-text-secondary]">Select an ad to watch and earn FOG Coin rewards.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockAds.map(ad => <AdCard key={ad.id} ad={ad} />)}
            </div>
          </>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24 min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          {...{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 },
            transition: { duration: 0.3 },
          }}
        >
          {view !== 'list' && (
            <div className="mb-6">
                <Button variant="ghost" onClick={resetFlow}>
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back to Ad List
                </Button>
            </div>
          )}
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WatchAdsPage;