// src/hooks/useCountUp.js
import { useEffect, useRef, useState } from "react";

export function useCountUp(target = 0, duration = 1200) {
  const [value, setValue] = useState(0);
  const frame = useRef(null);
  const startTime = useRef(null);

  useEffect(() => {
    startTime.current = null;
    cancelAnimationFrame(frame.current);

    const tick = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(eased * target));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return value;
}