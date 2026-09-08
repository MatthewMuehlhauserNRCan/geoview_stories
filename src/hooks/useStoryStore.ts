import { useEffect, useState } from 'react';
import { StoryStore } from '@/core/stores/StoryStore';
import { StoryConfig } from '@/types/StoryConfig';

/**
 * Hook to subscribe to store updates
 * Syncs store state with React component state
 */
export const useStoryStore = () => {
  const store = StoryStore.getInstance();
  const [config, setConfig] = useState<StoryConfig | null>(store.getConfig());
  const [loading, setLoading] = useState(store.getLoading());
  const [error, setError] = useState(store.getError());
  const [initialized, setInitialized] = useState(store.isReady());
  const [activeSlideIndex, setActiveSlideIndex] = useState(store.getActiveSlideIndex());

  useEffect(() => {
    // Subscribe to store changes
    const unsubscribe = store.subscribe(() => {
      setConfig(store.getConfig());
      setLoading(store.getLoading());
      setError(store.getError());
      setInitialized(store.isReady());
      setActiveSlideIndex(store.getActiveSlideIndex());
    });

    return () => {
      unsubscribe();
    };
  }, [store]);

  return { config, loading, error, initialized, activeSlideIndex, store };
};
