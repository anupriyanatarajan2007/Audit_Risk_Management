// src/hooks/useEscapeKey.js
import { useEffect } from "react";

export function useEscapeKey(handler, active = true) {
  useEffect(() => {
    if (!active) return;
    const listener = (e) => {
      if (e.key === "Escape") handler(e);
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [handler, active]);
}