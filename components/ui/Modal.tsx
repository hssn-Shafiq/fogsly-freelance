import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  preventBackgroundClose?: boolean;
}

const Modal = ({ isOpen, onClose, title, children, preventBackgroundClose = false }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          {...{
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.2 },
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={preventBackgroundClose ? undefined : onClose}
        >
          <motion.div
            {...{
              initial: { opacity: 0, scale: 0.95, y: 10 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.95, y: 10 },
              transition: { type: 'spring', stiffness: 400, damping: 30 },
            }}
            className="relative w-full max-w-md my-8 mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="shadow-2xl max-h-[90vh] flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
                <CardTitle className="text-xl">{title}</CardTitle>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full text-[--color-text-secondary] hover:bg-[--color-bg-secondary] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent className="overflow-y-auto flex-1">
                {children}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;