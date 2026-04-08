import React from 'react';
import { cn } from './utils';

export function ShimmerButton({ children, className, shimmerColor = '#ffffff', shimmerSize = '0.05em', shimmerDuration = '3s', borderRadius = '0px', background = 'rgba(0, 180, 216, 1)', ...props }) {
  return (
    <button
      style={{ '--shimmer-color': shimmerColor, '--shimmer-size': shimmerSize, '--shimmer-duration': shimmerDuration, '--border-radius': borderRadius, '--background': background, '--spread': '90deg' }}
      className={cn(
        'group relative z-0 flex cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap px-6 py-3',
        'text-black font-bold uppercase text-sm tracking-wider',
        '[background:var(--background)]',
        'transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
        'before:absolute before:inset-0 before:-z-[1]',
        'after:absolute after:inset-0 after:-z-[1]',
        className
      )}
      {...props}
    >
      <div className={cn(
        'absolute inset-0 overflow-hidden',
        '[border-radius:var(--border-radius)]',
      )}>
        <div className={cn(
          'absolute inset-[-100%] animate-[spin_var(--shimmer-duration)_linear_infinite]',
          'bg-[conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]',
        )} />
      </div>
      <div className="absolute inset-[1px] [background:var(--background)]" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
