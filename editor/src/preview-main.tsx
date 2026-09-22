import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { StoryViewer } from '@/components/story/StoryViewer';
import { useStoryLoading } from '@/core/stores/StoryStore';
import { waitForLayoutSettled } from '@/utils/waitForLayoutSettled';
import '@/styles/panels.css'; // Not imported by StoryViewer itself - only the library's own index.tsx does this normally

/**
 * Mounted in its own isolated page (preview.html, loaded via an <iframe> from the editor), not
 * embedded directly in the editor's own layout - StoryViewer's TableOfContents Drawer portals to
 * document.body regardless of where it's mounted, so directly embedding it inside a smaller pane
 * makes it overlay the entire editor UI. An iframe gives it a real, isolated viewport of its own.
 */
const configPath = new URLSearchParams(window.location.search).get('configPath') ?? '';

/** Tells the parent editor once this reload has finished rendering, so it can restore the
 * scroll position the user was at before the edit that triggered this reload - PreviewPane.tsx
 * has to fully reload this page on every edit (StoryViewer only ever loads its configPath once
 * per mount), which would otherwise visually snap back to the top of the story every time. */
const ReadySignal: React.FC = () => {
  const loading = useStoryLoading();

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    waitForLayoutSettled().then(() => {
      if (!cancelled) window.parent.postMessage({ type: 'geoview-story-preview-ready' }, '*');
    });
    return () => {
      cancelled = true;
    };
  }, [loading]);

  return null;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoryViewer configPath={configPath} />
    <ReadySignal />
  </React.StrictMode>
);
