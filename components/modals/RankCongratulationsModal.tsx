import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Star, Sparkles, PartyPopper } from 'lucide-react';
import { Button } from '../ui/Button';
import FogslyRankBanner from '../badges/FogslyRankBanner';

interface RankCongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRank: number;
  userName: string;
  isNewUser?: boolean;
}

const RankCongratulationsModal = ({ 
  isOpen, 
  onClose, 
  userRank, 
  userName,
  isNewUser = false 
}: RankCongratulationsModalProps) => {
  const [showContent, setShowContent] = useState(false);

  // Determine tier based on rank
  const getTier = (rank: number) => {
    if (rank <= 5) return 'legend';
    if (rank <= 20) return 'master';
    if (rank <= 100) return 'vanguard';
    if (rank <= 300) return 'earlybird';
    if (rank <= 1000) return 'champion';
    return 'rookie';
  };

  const tier = getTier(userRank);

  // Get congratulatory messages based on tier and new user status
  const getMessages = () => {
    const baseMessages = {
      legend: {
        title: "🏅 LEGEND ACHIEVED! 🏅",
        subtitle: `Welcome to the elite, ${userName}!`,
        achievement: "Top 5 Worldwide",
        description: "You've reached the pinnacle of FOGSLY! As a Legend, you're among the top 5 users globally. Your expertise and dedication have earned you the highest honors."
      },
      master: {
        title: "👑 MASTER STATUS! 👑",
        subtitle: `Outstanding achievement, ${userName}!`,
        achievement: "Top 20 Worldwide",
        description: "Exceptional! You've mastered the FOGSLY platform and earned your place among the top 20 users. Your skills are truly remarkable."
      },
      vanguard: {
        title: "⚡ VANGUARD ELITE! ⚡",
        subtitle: `Impressive progress, ${userName}!`,
        achievement: "Top 100 Worldwide",
        description: "You're leading the way! As a Vanguard member, you're in the top 100 users, setting the standard for excellence on FOGSLY."
      },
      earlybird: {
        title: "🐦 EARLY BIRD! 🐦",
        subtitle: `Great start, ${userName}!`,
        achievement: "Top 300 Worldwide",
        description: "You're off to a fantastic start! Your early adoption and engagement have earned you a spot in the top 300 users."
      },
      champion: {
        title: "🏆 CHAMPION RANK! 🏆",
        subtitle: `Well done, ${userName}!`,
        achievement: "Top 1000 Worldwide",
        description: "Congratulations on becoming a Champion! You're among the top 1000 users, showcasing your commitment to the FOGSLY community."
      },
      rookie: {
        title: "🌱 WELCOME ROOKIE! 🌱",
        subtitle: `Great to have you, ${userName}!`,
        achievement: "New Member",
        description: "Welcome to FOGSLY! You're starting your journey with unlimited potential. Every expert was once a beginner!"
      }
    };

    const messages = baseMessages[tier as keyof typeof baseMessages];
    
    // Customize for new users
    if (isNewUser) {
      return {
        ...messages,
        title: `🎉 ${messages.title} 🎉`,
        subtitle: `Welcome to FOGSLY, ${userName}!`,
        description: `${messages.description} Your adventure begins now!`
      };
    }
    
    return messages;
  };

  const messages = getMessages();

  // Animation variants
  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: -50,
      transition: {
        duration: 0.3
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    }
  };

  // Trigger content animation after modal appears
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  // Prevent closing when clicking on modal content
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const floatingElements = Array.from({ length: 8 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute"
      style={{
        left: `${10 + (i * 10)}%`,
        top: `${15 + (i % 3) * 20}%`,
      }}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 180, 360],
        opacity: [0.4, 0.8, 0.4],
      }}
      transition={{
        duration: 3 + (i * 0.5),
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.2,
      }}
    >
      {i % 4 === 0 ? (
        <Star className="w-4 h-4 text-yellow-400" />
      ) : i % 4 === 1 ? (
        <Sparkles className="w-4 h-4 text-blue-400" />
      ) : i % 4 === 2 ? (
        <Trophy className="w-3 h-3 text-yellow-500" />
      ) : (
        <PartyPopper className="w-4 h-4 text-purple-400" />
      )}
    </motion.div>
  ));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop with celebratory effect */}
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Floating celebration elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {floatingElements}
          </div>

          {/* Modal content */}
          <motion.div
            className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-scrollable"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleContentClick}
          >
            {/* Main content with scroll */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-white/10 shadow-2xl">
              {/* Close button */}
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>

              <div className="p-8 md:p-12">
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate={showContent ? "visible" : "hidden"}
                  className="text-center space-y-8"
                >
                  {/* Header */}
                  <motion.div variants={itemVariants} className="space-y-4">
                    <motion.h1 
                      className="text-3xl md:text-5xl font-black text-white mb-2"
                      animate={{ 
                        textShadow: [
                          "0 0 20px rgba(255,255,255,0.5)",
                          "0 0 30px rgba(255,255,255,0.8)",
                          "0 0 20px rgba(255,255,255,0.5)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {messages.title}
                    </motion.h1>
                    <motion.p 
                      className="text-xl md:text-2xl text-gray-300 font-semibold"
                      variants={itemVariants}
                    >
                      {messages.subtitle}
                    </motion.p>
                  </motion.div>

                  {/* Rank Banner */}
                  <motion.div variants={itemVariants}>
                    <FogslyRankBanner 
                      rank={userRank} 
                      tier={tier}
                      label={messages.title.replace(/[🎉👑⚡🐦🏅🌱]/g, '').trim()}
                      compact={false}
                    />
                  </motion.div>

                  {/* Achievement badge */}
                  <motion.div 
                    variants={itemVariants}
                    className="flex justify-center"
                  >
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full px-6 py-3">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      <span className="text-yellow-300 font-bold text-lg">
                        {messages.achievement}
                      </span>
                    </div>
                  </motion.div>

                  {/* Description */}
                  <motion.div variants={itemVariants} className="max-w-3xl mx-auto">
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {messages.description}
                    </p>
                  </motion.div>

                  {/* Action buttons */}
                  <motion.div 
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                  >
                    <Button
                      onClick={onClose}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Your Journey
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="px-6 py-3 border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl"
                    >
                      Continue
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankCongratulationsModal;
