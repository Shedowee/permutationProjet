import React, { useEffect, useState } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Petit délai pour déclencher l'animation d'entrée
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Délai pour l'animation de sortie (200ms)
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`relative ${sizes[size]} w-full max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-surface-200 shadow-2xl transition-all duration-300 transform ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-surface-900 tracking-tight">{title}</h3>
            {showCloseButton && (
              <button 
                onClick={onClose}
                className="p-2 rounded-xl bg-surface-50 text-surface-400 hover:text-surface-900 hover:bg-surface-100 transition-all duration-200 focus:outline-none"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="text-surface-600">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
