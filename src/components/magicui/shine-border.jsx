import React from 'react';
import { cn } from './utils';

export function ShineBorder({ children, className, color = ['#00B4D8', '#0096C7'], borderWidth = 1, duration = 14, ...props }) {
  return (
    <div
      style={{ '--border-width': `${borderWidth}px`, '--duration': `${duration}s`, '--mask-linear-gradient': `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`, '--background-radial-gradient': `radial-gradient(transparent,transparent, ${Array.isArray(color) ? color.join(',') : color},transparent,transparent)` }}
      className={cn(
        'relative rounded-[inherit] before:absolute before:inset-0 before:rounded-[inherit] before:p-[var(--border-width)] before:will-change-[background-position] before:content-[""] before:![-webkit-mask-composite:xor] before:![mask-composite:exclude] before:[background-image:var(--background-radial-gradient)] before:[background-size:300%_300%] before:[mask:var(--mask-linear-gradient)] motion-safe:before:animate-shine-border',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
