/**
 * Resolves once the page stops growing/shrinking (debounced), or after `maxWaitMs` regardless -
 * so a scroll-to-slide doesn't compute its target against a layout that's about to reflow
 * underneath it (e.g. a map's async POI list still loading in the background).
 */
export const waitForLayoutSettled = (maxWaitMs = 6000, quietMs = 400): Promise<void> => {
  return new Promise((resolve) => {
    let settled = false;
    let quietTimer: number;

    const finish = () => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      window.clearTimeout(maxTimer);
      window.clearTimeout(quietTimer);
      resolve();
    };

    const maxTimer = window.setTimeout(finish, maxWaitMs);
    const observer = new ResizeObserver(() => {
      window.clearTimeout(quietTimer);
      quietTimer = window.setTimeout(finish, quietMs);
    });
    observer.observe(document.body);
    quietTimer = window.setTimeout(finish, quietMs);
  });
};
