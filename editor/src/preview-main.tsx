import React from 'react';
import ReactDOM from 'react-dom/client';
import { StoryViewer } from '@/components/story/StoryViewer';

/**
 * Mounted in its own isolated page (preview.html, loaded via an <iframe> from the editor), not
 * embedded directly in the editor's own layout - StoryViewer's TableOfContents Drawer portals to
 * document.body regardless of where it's mounted, so directly embedding it inside a smaller pane
 * makes it overlay the entire editor UI. An iframe gives it a real, isolated viewport of its own.
 */
const configPath = new URLSearchParams(window.location.search).get('configPath') ?? '';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoryViewer configPath={configPath} />
  </React.StrictMode>
);
