import { useEffect, useState } from 'react';
import { StoryStore } from '@/core/stores/StoryStore';

/**
 * Hook to track whether a specific GeoView map is ready.
 *
 * cgpv.onMapReady is a single global callback slot (not a per-listener pub/sub),
 * so only StoryController is allowed to call it directly. This hook reads the
 * per-map ready state that the controller mirrors into StoryStore instead.
 */
export const useMapReady = (mapId: string): boolean => {
  const store = StoryStore.getInstance();
  const [ready, setReady] = useState(store.isMapReady(mapId));

  useEffect(() => {
    setReady(store.isMapReady(mapId));

    return store.subscribe(() => {
      setReady(store.isMapReady(mapId));
    });
  }, [mapId, store]);

  return ready;
};
