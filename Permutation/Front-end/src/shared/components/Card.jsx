import React from 'react';

const Card = ({ children, className = '', gradient = 'blue', elevated = false }) => {
  const gradientClasses = {
    blue: 'from-blue-500/20 to-indigo-500/20',
    purple: 'from-purple-500/20 to-violet-500/20',
    indigo: 'from-indigo-500/20 to-blue-500/20',
  };

  const gradientClass = gradientClasses[gradient] || gradientClasses.blue;
  
  return (
    <div 
      className={`bg-gradient-to-br ${gradientClass} backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-xl ${elevated ? 'shadow-blue-500/10' : ''} ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)'
      }}
    >
      {children}
    </div>
  );
};

export default Card;
