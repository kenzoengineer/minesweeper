import { useEffect, useRef, useState } from "react";

export const useElementSize = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial size from element's bounding rect
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 || rect.height > 0) {
      setSize({ width: rect.width, height: rect.height });
    }

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
};
