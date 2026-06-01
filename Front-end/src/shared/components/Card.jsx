import React from 'react';
import { useContext } from 'react';
import { motion } from 'framer-motion';
import { DashboardSurfaceContext } from '../context/DashboardSurfaceContextBase';

const Card = ({
  children,
  className = '',
  variant = 'default',
  noPadding = false,
  hover = true,
  onClick,
  role,
  tabIndex,
  ...props
}) => {
  const dashboardSurface = useContext(DashboardSurfaceContext);
  const variants = {
    default: dashboardSurface
      ? 'surface-panel'
      : 'bg-white/92 border border-slate-200/80 shadow-[0_18px_44px_-32px_rgba(15,23,42,0.26)]',
    institutional: dashboardSurface
      ? 'surface-panel-strong'
      : 'bg-gradient-to-br from-white via-sky-50/60 to-emerald-50/50 border border-sky-100 shadow-[0_20px_48px_-34px_rgba(15,23,42,0.28)]',
    glass: dashboardSurface
      ? 'surface-panel'
      : 'bg-white/88 backdrop-blur-xl border border-slate-200/80 shadow-[0_18px_44px_-32px_rgba(15,23,42,0.26)]',
    primary: 'bg-primary-50 border border-primary-100 text-primary-900',
    accent: 'bg-primary-50 border border-primary-200 text-primary-900',
    danger: 'bg-red-50 border border-red-100 text-red-900',
    warning: 'bg-amber-50 border border-amber-100 text-amber-900',
    success: 'bg-green-50 border border-green-100 text-green-900',
    dark: 'surface-dark bg-surface-900 border border-surface-800 text-white shadow-hard',
  };

  const selectedVariant = variants[variant] || variants.default;
  const forceDarkText = dashboardSurface && variant !== 'dark';
  
  return (
    <motion.div 
      whileHover={hover ? { y: -2, boxShadow: '0 24px 54px -36px rgba(15, 23, 42, 0.3)' } : {}}
      onClick={onClick}
      role={role || (onClick ? 'button' : undefined)}
      tabIndex={tabIndex ?? (onClick ? 0 : undefined)}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(event);
        }
      }}
      className={`
        rounded-lg transition-standard relative overflow-hidden
        ${onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:ring-offset-2 focus:ring-offset-transparent' : ''}
        ${selectedVariant}
        ${noPadding ? '' : 'p-5 sm:p-6'}
        ${className}
        ${forceDarkText ? '!text-surface-900' : ''}
      `}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/50" />
      {children}
    </motion.div>
  );
};

export default Card;
