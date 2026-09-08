import { StoryConfig } from '@/types/StoryConfig';

/**
 * StoryStore - Holds and manages story state
 * Follows GeoView pattern: store without React dependencies
 * Can be used standalone or with React via listeners
 */
export class StoryStore {
  private static instance: StoryStore;
  
  private config: StoryConfig | null = null;
  private isInitialized = false;
  private isLoading = true; // Story starts in a loading state until the controller loads a config
  private error: string | null = null;
  private activeSlideIndex = 0;
  private mapReadyStates = new Map<string, boolean>(); // Track which maps are ready

  // Listener system for React/other consumers
  private listeners = new Set<() => void>();

  private constructor() {}

  static getInstance(): StoryStore {
    if (!StoryStore.instance) {
      StoryStore.instance = new StoryStore();
    }
    return StoryStore.instance;
  }

  // State getters
  getConfig(): StoryConfig | null {
    return this.config;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  getLoading(): boolean {
    return this.isLoading;
  }

  getError(): string | null {
    return this.error;
  }

  getActiveSlideIndex(): number {
    return this.activeSlideIndex;
  }

  isMapReady(mapId: string): boolean {
    return this.mapReadyStates.get(mapId) ?? false;
  }

  // State setters
  setConfig(config: StoryConfig): void {
    this.config = config;
    this.notify();
  }

  setInitialized(initialized: boolean): void {
    this.isInitialized = initialized;
    this.notify();
  }

  setLoading(loading: boolean): void {
    this.isLoading = loading;
    this.notify();
  }

  setError(error: string | null): void {
    this.error = error;
    this.notify();
  }

  setActiveSlideIndex(index: number): void {
    this.activeSlideIndex = index;
    this.notify();
  }

  setMapReady(mapId: string, ready: boolean): void {
    this.mapReadyStates.set(mapId, ready);
    this.notify();
  }

  // Listener system (minimal pubsub)
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  // Reset for cleanup
  reset(): void {
    this.config = null;
    this.isInitialized = false;
    this.isLoading = true;
    this.error = null;
    this.activeSlideIndex = 0;
    this.mapReadyStates.clear();
    this.notify();
  }
}
