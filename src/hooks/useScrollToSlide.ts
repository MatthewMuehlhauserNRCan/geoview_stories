import { useCallback } from 'react';

/**
 * Hook to handle smooth scrolling to slides
 */
export const useScrollToSlide = (headerHeight: number = 64) => {
  const scrollToSlide = useCallback(
    (slideId: string) => {
      const element = document.getElementById(slideId);
      if (!element) return;

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
