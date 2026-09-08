/** Hook to read the story store's core fields, re-rendering only when one of them changes */
export declare const useStoryStore: () => {
    config: import("../types/StoryConfig").StoryConfig | null;
    loading: boolean;
    error: string | null;
    initialized: boolean;
    activeSlideIndex: number;
    store: import("zustand").StoreApi<import("@/core/stores/StoryStore").StoryState>;
};
//# sourceMappingURL=useStoryStore.d.ts.map