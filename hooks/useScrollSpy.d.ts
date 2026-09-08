import { RefObject } from 'react';
/**
 * Hook to track which slide is currently in the viewport
 * and update URL hash accordingly. Also mirrors the active index into
 * StoryStore so it's available as shared state outside this component.
 */
export declare const useScrollSpy: (slideRefs: RefObject<HTMLElement | null>[], slideIds: string[], enabled?: boolean) => number;
//# sourceMappingURL=useScrollSpy.d.ts.map