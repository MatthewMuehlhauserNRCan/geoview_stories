import { useLayoutEffect, useRef, RefObject, DependencyList } from 'react';

/**
 * Keeps the user's visual scroll position stable when the element behind `ref` grows/shrinks
 * while it's entirely above the current viewport (e.g. async content, like auto-generated POI
 * cards, finishing after the user has already scrolled past it). Without this, the browser leaves
 * scrollY unchanged, which visually "bounces" the page since everything below the change shifts
 * by the size delta even though the user never scrolled.
 */
export const usePreserveScrollOnGrowth = (ref: RefObject<HTMLElement | null>, deps: DependencyList): void => {
  const prevHeightRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const prevHeight = prevHeightRef.current;
    prevHeightRef.current = rect.height;
    if (prevHeight === null) return;

    const delta = rect.height - prevHeight;
    // Check the element's position BEFORE this growth, not after: rect.bottom already reflects the
    // new (taller) height, so a large-enough delta can push it back into/past the viewport even
    // though the change itself happened entirely in a region the user had already scrolled past.
    // A small positive tolerance (rather than requiring a strict <= 0) absorbs timing noise around
    // the exact moment of the change (e.g. an in-progress smooth scroll settling by a few px) -
    // without it, a barely-visible sliver of the old element can wrongly read as "still ahead".
    const oldBottom = rect.top + prevHeight;
    const wasEffectivelyBehindViewport = oldBottom <= 200;
    if (delta !== 0 && wasEffectivelyBehindViewport) {
      window.scrollBy(0, delta);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
