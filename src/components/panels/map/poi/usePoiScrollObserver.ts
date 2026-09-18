import { useEffect, useRef, useState } from 'react';

/**
 * Tracks which POI card is currently in the scroll-triggered "active" band and calls onActivate
 * once per transition. Shared by ManualPoiMapPanel and AutoPoiMapPanel - the scroll mechanics are
 * identical regardless of where the POI list itself came from (authored vs. derived from features).
 */
export const usePoiScrollObserver = (count: number, enabled: boolean, onActivate: (index: number) => void) => {
  const poiRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activePoiIndex, setActivePoiIndex] = useState<number | null>(null);
  // Mirrors activePoiIndex for the observer callback, which reads it via ref (not the closured
  // state) so the observer never needs to be torn down and recreated when the active POI changes.
  const activePoiIndexRef = useRef<number | null>(null);
  // Kept fresh every render (not a dependency of the effect below) so the observer-recreation
  // effect only needs to depend on `enabled`/`count`, not a new function identity every render.
  const onActivateRef = useRef(onActivate);
  useEffect(() => {
    onActivateRef.current = onActivate;
  });

  useEffect(() => {
    if (!enabled || count === 0) return;

    // Check if mobile or desktop for rootMargin adjustment
    const isMobile = window.matchMedia('(max-width: 899px)').matches; // MUI 'md' breakpoint is 900px

    const observerOptions = {
      root: null,
      // On mobile, account for sticky map at top (40vh), trigger when POI is in visible area below map
      // On desktop, trigger when POI is in center 30% of viewport
      rootMargin: isMobile ? '-45% 0px -20% 0px' : '-35% 0px -35% 0px',
      threshold: 0.5, // Trigger when 50% visible
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = poiRefs.current.findIndex((ref) => ref === entry.target);
          if (index !== -1 && index !== activePoiIndexRef.current) {
            // Update the ref immediately so a second entry in this same batch
            // (e.g. one POI exiting as another enters) sees the fresh value.
            activePoiIndexRef.current = index;
            setActivePoiIndex(index);
            onActivateRef.current(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    poiRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [enabled, count]);

  return { poiRefs, activePoiIndex };
};
