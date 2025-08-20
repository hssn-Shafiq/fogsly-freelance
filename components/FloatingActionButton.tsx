import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Headset } from 'lucide-react';
import { type Route } from '../types';

interface FloatingActionButtonProps {
  navigate: (route: Route) => void;
}

const FloatingActionButton = ({ navigate }: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const subButtonVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    }),
    exit: (i: number) => ({
        opacity: 0,
        y: 10,
        scale: 0.9,
        transition: {
          delay: i * 0.05,
          duration: 0.15
        },
      }),
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="flex flex-col items-center gap-4 mb-4"
          >
            <motion.button
              custom={1}
              variants={subButtonVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => navigate('customer-service')}
              className="group relative flex items-center justify-center w-14 h-14 bg-[--color-card] text-[--color-text-primary] rounded-full shadow-lg hover:bg-[--color-bg-secondary] transition-colors"
              aria-label="Customer Service"
            >
              <Headset className="w-6 h-6" />
              <span className="absolute right-full mr-4 px-3 py-1.5 bg-[--color-card] text-[--color-text-primary] text-xs font-semibold rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Customer Service
              </span>
            </motion.button>
            <motion.button
              custom={0}
              variants={subButtonVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => navigate('chat')}
              className="group relative flex items-center justify-center w-14 h-14 bg-[--color-card] text-[--color-text-primary] rounded-full shadow-lg hover:bg-[--color-bg-secondary] transition-colors"
              aria-label="Messages"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="absolute right-full mr-4 px-3 py-1.5 bg-[--color-card] text-[--color-text-primary] text-xs font-semibold rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Messages
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleOpen}
        className="w-16 h-16 bg-[--color-primary] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-[--color-primary]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--color-primary] focus:ring-offset-[--color-bg-primary]"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-expanded={isOpen}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <Plus className="w-8 h-8" />
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;