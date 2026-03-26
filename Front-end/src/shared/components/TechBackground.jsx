import React from 'react';

const TechBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-surface-50">
      {/* Soft background gradients */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-100/30 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-surface-100/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: 'radial-gradient(#009245 0.5px, transparent 0.5px)', 
          backgroundSize: '24px 24px' 
        }}
      ></div>

      {/* Subtle lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary-500" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};

export default TechBackground;
