import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';
import { cn } from './utils';

export function NumberTicker({ value, direction = 'up', delay = 0, className, decimalPlaces = 0 }) {
  const ref = useRef(null);
  const motionVal = useMotionValue(direction === 'down' ? value : 0);
  const spring = useSpring(motionVal, { damping: 60, stiffness: 100 });
  const isInView = useInView(ref, { once: true, margin: '0px' });

  useEffect(() => {
    if (isInView) {
      setTimeout(() => motionVal.set(direction === 'down' ? 0 : value), delay * 1000);
    }
  }, [isInView, value, delay, direction, motionVal]);

  useEffect(() => {
    return spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = Intl.NumberFormat('pt-BR', { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }).format(Number(v.toFixed(decimalPlaces)));
    });
  }, [spring, decimalPlaces]);

  return <span ref={ref} className={cn('inline-block tabular-nums', className)} />;
}
