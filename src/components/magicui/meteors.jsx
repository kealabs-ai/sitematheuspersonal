import React from 'react';
import { cn } from './utils';

export function Meteors({ number = 20, className }) {
  const meteors = Array.from({ length: number }, (_, i) => ({
    id: i,
    top: Math.floor(Math.random() * 100),
    left: Math.floor(Math.random() * 100),
    delay: Math.random() * 0.6 + 0.2,
    duration: Math.floor(Math.random() * 8 + 4),
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {meteors.map((m) => (
        <span
          key={m.id}
          style={{ top: `${m.top}%`, left: `${m.left}%`, animationDelay: `${m.delay}s`, animationDuration: `${m.duration}s` }}
          className={cn(
            'absolute h-px w-[80px] rotate-[215deg] animate-meteor-effect rounded-full',
            'bg-gradient-to-r from-[#00B4D8] to-transparent shadow-[0_0_0_1px_#ffffff08]',
            'before:absolute before:top-1/2 before:h-px before:w-[50%] before:-translate-y-1/2 before:bg-gradient-to-r before:from-[#00B4D8] before:to-transparent',
            className,
          )}
        />
      ))}
    </div>
  );
}
