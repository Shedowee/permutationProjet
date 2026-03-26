import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm transition-opacity"
              onClick={onClose}
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative w-full ${sizes[size]} transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-hard transition-all`}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-surface-900 tracking-tight uppercase">
                  {title}
                </h3>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-standard"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                )}
              </div>
              
              <div className="mt-2">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
