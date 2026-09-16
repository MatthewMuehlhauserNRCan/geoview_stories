import { useCallback } from 'react';
import { waitForLayoutSettled } from '@/utils/waitForLayoutSettled';
import { waitForPendingLoadsCleared } from '@/core/stores/StoryStore';

/**
 * Hook to handle smooth scrolling to slides
 */
export const useScrollToSlide = (headerHeight: number = 64) => {
  const scrollToSlide = useCallback(
    async (slideId: string) => {
      const element = document.getElementById(slideId);
      if (!element) return;

      // Otherwise the target position is computed against a page that's still growing (e.g. an
      // auto-POI map's card list still loading), and a later size change either lands us somewhere
      // wrong or, worse, fights this in-progress smooth scroll and snaps us to an unrelated spot.
      // Known async content (explicitly tracked) is awaited first since it can take a while
      // before it even starts resizing anything, which a resize-quiet check alone can't predict.
      await waitForPendingLoadsCleared();
      await waitForLayoutSettled();

      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetPosition = rect.top + scrollTop - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });

      // Move focus so keyboard/screen-reader users land on the slide instead
      // of staying on the TOC link; preventScroll avoids fighting the smooth scroll above.
      element.focus({ preventScroll: true });
    },
    [headerHeight]
  );

  return scrollToSlide;
};
