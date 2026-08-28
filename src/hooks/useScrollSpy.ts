import { useEffect, useState, useRef, RefObject } from 'react';

/**
 * Hook to track which slide is currently in the viewport
 * and update URL hash accordingly
 */
export const useScrollSpy = (
  slideRefs: RefObject<HTMLElement | null>[],
  slideIds: string[],
  enabled: boolean = true
): number => {
  const [activeIndex, setActiveIndex] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const intersectionMapRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!enabled || slideRefs.length === 0) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Reset intersection map
    intersectionMapRef.current = new Map();

    // Create new IntersectionObserver
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id) {
            // Store intersection ratio for each slide
            if (entry.isIntersecting) {
              intersectionMapRef.current.set(entry.target.id, entry.intersectionRatio);
            } else {
              intersectionMapRef.current.delete(entry.target.id);
            }
          }
        });

        // Find the slide with highest intersection ratio
        let maxRatio = 0;
        let maxId = '';
        intersectionMapRef.current.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            maxId = id;
          }
        });

        if (maxId) {
          const index = slideIds.indexOf(maxId);
          if (index !== -1) {
            setActiveIndex(index);
            
            // Update URL hash without scrolling
            const newHash = `#${maxId}`;
            if (window.location.hash !== newHash) {
              window.history.replaceState(null, '', newHash);
            }
          }
        }
      },
      {
        root: null,
        rootMargin: '-10% 0px -50% 0px', // More lenient trigger zone
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5], // Multiple thresholds for better tracking
      }
    );

    // Observe all slide elements
    slideRefs.forEach((ref) => {
      if (ref.current) {
        observerRef.current?.observe(ref.current);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [slideRefs, slideIds, enabled]);

  return activeIndex;
};
