import { useEffect, useRef, useState } from "react";

export const useIntersectionObserver = (opts?: IntersectionObserverInit) => {
  // Hook implementation here
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);

  // Example observer setup (not fully implemented)
  // In a real implementation, you would set up the IntersectionObserver here
  // and update isIntersecting based on the observer's callback.

  useEffect(() => {
    // Setup IntersectionObserver logic here
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsIntersecting(entry.isIntersecting);
      });
    }, opts);

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }
    // Cleanup on unmount
    return () => {
      observer.disconnect();
    };
  }, [opts]);

  return { isIntersecting, targetRef };
};
