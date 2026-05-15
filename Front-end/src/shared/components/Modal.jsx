import React from 'react';
import { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { DashboardSurfaceContext } from '../context/DashboardSurfaceContextBase';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  const dashboardSurface = useContext(DashboardSurfaceContext);
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
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
              onClick={onClose}
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`surface-modal relative w-full ${sizes[size]} transform overflow-hidden p-4 sm:p-5 text-left align-middle transition-all max-h-[calc(100vh-5rem)] overflow-y-auto ${dashboardSurface ? 'text-surface-900' : 'bg-gradient-to-br from-primary-50/90 via-white to-primary-100/55 border-2 border-primary-200 ring-1 ring-inset ring-primary-100/70'}`}
            >
              <div className="flex items-center justify-between mb-4 pb-3 sm:pb-4 border-b border-white/70">
                <h3 className="text-lg sm:text-xl font-black text-surface-900 tracking-tight uppercase">
                  {title}
                </h3>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2.5 rounded-xl text-surface-500 hover:text-primary-700 hover:bg-primary-50 transition-standard border-2 border-primary-100 hover:border-primary-200"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="mt-0 text-surface-700">
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
