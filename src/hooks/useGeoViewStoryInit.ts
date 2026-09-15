import { useEffect, useRef } from 'react';
import { StoryController } from '@/core/controllers/StoryController';

/**
 * Hook to initialize story viewer using StoryController
 * Call once in your story viewer component
 * 
 * @param configPath - Path to story config JSON
 */
export const useStoryInit = (configPath: string) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initDoneRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (initDoneRef.current) return;
    initDoneRef.current = true;

    if (!containerRef.current) return;

    const controller = StoryController.getInstance();
    controller.init(containerRef.current, configPath).catch(err => {
      console.error('[useStoryInit] Failed to initialize story:', err);
    });
  }, [configPath]);

  return containerRef;
};

