import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import Card from './Card';

const StatCard = ({ title, value, subValue, icon, color = 'primary', percentage, trend, to, onClick, selected = false, detailLabel = 'Voir détails', compact = false }) => {
  const navigate = useNavigate();
  const safePercentage = Number.isFinite(Number(percentage)) ? Number(percentage) : 0;
  const accent = {
    primary: {
      text: 'text-primary-700',
      bg: 'bg-primary-500',
      ring: 'ring-primary-200/40',
      gradient: 'linear-gradient(90deg, #009245 0%, #18a874 100%)',
    },
    secondary: {
      text: 'text-primary-700',
      bg: 'bg-primary-400',
      ring: 'ring-primary-200/40',
      gradient: 'linear-gradient(90deg, #007b3a 0%, #009245 100%)',
    },
    success: {
      text: 'text-primary-700',
      bg: 'bg-primary-600',
      ring: 'ring-primary-200/40',
      gradient: 'linear-gradient(90deg, #18a874 0%, #009245 100%)',
    },
    accent: {
      text: 'text-primary-700',
      bg: 'bg-primary-500',
      ring: 'ring-primary-200/40',
      gradient: 'linear-gradient(90deg, #35c98e 0%, #009245 100%)',
    },
    danger: {
      text: 'text-jb-red',
      bg: 'bg-jb-red',
      ring: 'ring-jb-red/15',
      gradient: 'linear-gradient(90deg, #e25555 0%, #f97316 100%)',
    },
  }[color] || {
    text: 'text-primary-700',
    bg: 'bg-primary-500',
    ring: 'ring-primary-200/40',
    gradient: 'linear-gradient(90deg, #009245 0%, #18a874 100%)',
  };

  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
      return;
    }

    if (to) {
      navigate(to);
    }
  };

  const clickable = Boolean(onClick || to);

  return (
    <Card
      onClick={clickable ? handleClick : undefined}
      className={`group hover:shadow-xl transition-all overflow-hidden relative ${selected ? 'ring-2 ring-primary-300/30' : ''} ${compact ? 'p-4 sm:p-5' : 'p-6'}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-primary-100/70">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${Math.max(0, Math.min(100, safePercentage))}%`,
            background: accent.gradient,
          }}
        />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className={`space-y-4 min-w-0 ${compact ? 'pr-2' : ''}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-600">{title}</p>
          <div className="flex items-baseline gap-3">
            <h3 className={`${compact ? 'text-3xl sm:text-[2rem]' : 'text-4xl'} font-black tracking-tight text-surface-900`}>{String(value ?? 0)}</h3>
            {(percentage !== undefined || trend !== undefined) && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-white shadow-sm text-[10px] font-black ${accent.text} border-2 border-primary-100 ring-1 ring-inset ${accent.ring}`}>
                <ArrowTrendingUpIcon className="w-3 h-3" />
                <span>{percentage !== undefined ? `${Math.round(safePercentage)}%` : String(trend ?? '')}</span>
              </div>
            )}
          </div>
          {subValue && (
            <p className="text-[10px] font-black uppercase tracking-widest text-surface-500 italic">{subValue}</p>
          )}
        </div>
        <div 
          className={`rounded-2xl transition-standard group-hover:scale-110 text-white shadow-[0_22px_42px_-24px_rgba(0,146,69,0.34)] ring-2 ring-inset ${accent.ring} ${accent.bg} ${compact ? 'p-3 sm:p-3.5' : 'p-4'}`}
          style={{ background: accent.gradient }}
        >
          <div className={compact ? 'scale-90' : ''}>{icon}</div>
        </div>
      </div>

      {(percentage !== undefined || trend !== undefined) && (
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-surface-500">
            <span>{percentage !== undefined ? 'Progression' : 'Tendance'}</span>
            <span>{percentage !== undefined ? `${Math.round(safePercentage)}%` : String(trend ?? '')}</span>
          </div>
          {percentage !== undefined && (
            <div className="h-2 rounded-full bg-white/60 overflow-hidden border border-primary-100">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.max(0, Math.min(100, safePercentage))}%`,
                  background: accent.gradient,
                }}
              />
            </div>
          )}
        </div>
      )}

      {clickable && (
        <div className={`mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-surface-500 ${compact ? 'pt-1' : ''}`}>
            <span>Ouvrir</span>
          <span className={accent.text + ' group-hover:translate-x-1 transition-transform'}>{detailLabel}</span>
        </div>
      )}
      
      {/* Decorative background element */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-[0.05] group-hover:scale-150 transition-standard">
        {icon}
      </div>
    </Card>
  );
};

export default StatCard;
