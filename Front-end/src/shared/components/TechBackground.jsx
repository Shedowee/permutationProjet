import React from 'react';

const TechBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-slate-50">
      {/* Tech Geometric Pattern SVG */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.07]" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern 
            id="hexagons" 
            width="100" 
            height="173.2" 
            patternUnits="userSpaceOnUse" 
            patternTransform="scale(0.8)"
          >
            {/* Hexagon Outline */}
            <path 
              d="M50 0 L100 28.8 L100 86.6 L50 115.4 L0 86.6 L0 28.8 Z" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1"
              className="text-primary-500"
            />
            {/* Connecting lines */}
            <path 
              d="M50 0 L50 28.8 M100 28.8 L75 43.3 M100 86.6 L75 72.1 M50 115.4 L50 86.6 M0 86.6 L25 72.1 M0 28.8 L25 43.3" 
              stroke="currentColor" 
              strokeWidth="0.5"
              className="text-secondary-400"
            />
            {/* Nodes */}
            <circle cx="50" cy="0" r="2" className="fill-primary-400" />
            <circle cx="100" cy="28.8" r="2" className="fill-secondary-400" />
            <circle cx="50" cy="115.4" r="2" className="fill-accent-400" />
          </pattern>
          
          <linearGradient id="tech-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.05)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.05)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0.05)" />
          </linearGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#tech-gradient)" />
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>

      {/* Subtle Floating Orbs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary-200/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Animated Scan Line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent h-20 w-full -translate-y-full animate-scanline pointer-events-none"></div>
    </div>
  );
};

export default TechBackground;
