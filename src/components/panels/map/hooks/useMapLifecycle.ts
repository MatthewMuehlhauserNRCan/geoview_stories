import { useEffect, useState } from 'react';
import { useMapReady } from '@/core/stores/StoryStore';
import type { GeoviewThemeName } from '@/theme/buildTheme';

/**
 * Shared map init/lifecycle plumbing for any panel embedding a GeoView map: load-error detection,
 * ready state, theme sync (GeoView has no data-theme attribute of its own), and the Ctrl/Cmd
 * scroll-to-zoom guard. Used by MapPanel, ManualPoiMapPanel, and AutoPoiMapPanel alike.
 */
export const useMapLifecycle = (mapId: string, scrollguardEnabled: boolean | undefined, geoviewTheme: GeoviewThemeName) => {
  const [error, setError] = useState<string | null>(null);
  const [showScrollGuard, setShowScrollGuard] = useState(false);
  const mapReady = useMapReady(mapId);
  const loading = !error && !mapReady;

  // cgpv.onMapReady is a single global callback slot owned by StoryController;
  // this only checks that the library itself loaded.
  useEffect(() => {
    if (!window.cgpv) {
      setError('GeoView library not loaded');
    }
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    window.cgpv.api.getMapViewer(mapId)?.setTheme(geoviewTheme);
  }, [mapReady, geoviewTheme, mapId]);

  useEffect(() => {
    if (!scrollguardEnabled) return;

    let scrollGuardTimeoutId: number | null = null;
    const mapElement = document.getElementById(mapId);
    if (!mapElement) return;

    const handleWheel = (e: WheelEvent) => {
      // Allow zoom if Ctrl (Windows/Linux) or Cmd (Mac) is pressed
      if (e.ctrlKey || e.metaKey) {
        setShowScrollGuard(false);
        return;
      }

      // Only stop OL's own zoom-on-scroll from ever seeing this event - don't preventDefault, so
      // the browser's native scroll still runs (the page, or this card's own overflow when an
      // expanded footer bar makes it scrollable) instead of the wheel doing nothing at all.
      e.stopPropagation();
      setShowScrollGuard(true);

      if (scrollGuardTimeoutId) {
        window.clearTimeout(scrollGuardTimeoutId);
      }
      scrollGuardTimeoutId = window.setTimeout(() => {
        setShowScrollGuard(false);
      }, 1500);
    };

    // Use capture phase to intercept before GeoView's own handlers
    mapElement.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      mapElement.removeEventListener('wheel', handleWheel, { capture: true });
      if (scrollGuardTimeoutId) {
        window.clearTimeout(scrollGuardTimeoutId);
      }
    };
  }, [scrollguardEnabled, mapId]);

  return { error, loading, mapReady, showScrollGuard };
};
