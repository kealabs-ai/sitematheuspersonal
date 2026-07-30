import React from 'react';
import { cn } from './utils';

export function AnimatedGradientText({ children, className }) {
  return (
    <span className={cn(
      'inline animate-gradient bg-gradient-to-r from-[#00B4D8] via-[#ffffff] to-[#0096C7] bg-[length:var(--bg-size,300%)] bg-clip-text text-transparent',
      className,
    )}>
      {children}
    </span>
  );
}
