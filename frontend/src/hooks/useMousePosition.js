// src/hooks/useMousePosition.js
import { useRef, useCallback } from "react";

export function useMagneticHover(strength = 0.25) {
  const ref = useRef(null);

  const onMouseMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * strength;
      const y = (e.clientY - rect.top - rect.height / 2) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    },
    [strength]
  );

  const onMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "translate(0px, 0px)";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}