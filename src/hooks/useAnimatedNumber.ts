import { useEffect, useRef, useState } from 'react';

export function useAnimatedNumber(target: number, duration = 600): number {
  const [current, setCurrent] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const start = prevRef.current;
    const end = target;
    if (start === end) return;
    const startTime = performance.now();
    let rafId: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCurrent(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return current;
}
