import { useStore } from 'zustand';
import { storyStore } from '@/core/stores/StoryStore';

/** Hook to read the story store's core fields, re-rendering only when one of them changes */
export const useStoryStore = () => {
  const config = useStore(storyStore, (state) => state.config);
  const loading = useStore(storyStore, (state) => state.isLoading);
  const error = useStore(storyStore, (state) => state.error);
  const initialized = useStore(storyStore, (state) => state.isInitialized);
  const activeSlideIndex = useStore(storyStore, (state) => state.activeSlideIndex);

  return { config, loading, error, initialized, activeSlideIndex, store: storyStore };
};

