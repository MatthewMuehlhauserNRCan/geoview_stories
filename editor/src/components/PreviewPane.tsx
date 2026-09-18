import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import type { StoryConfig } from '@/types/StoryConfig';

const DEBOUNCE_MS = 600;

/**
 * Live preview of the current draft, rendered in an isolated <iframe> (preview.html) rather than
 * embedded directly - StoryViewer's TableOfContents uses a MUI Drawer, which portals to
 * document.body regardless of where StoryViewer itself is mounted, so a direct embed ends up
 * overlaying the entire editor page instead of staying confined to this pane.
 *
 * `fetch` (what loadStoryConfig uses) works against `blob:` object URLs exactly like a real file,
 * so a fresh Blob URL per (debounced) edit is all the preview page needs to pick up the current
 * draft. Blob URLs are readable from any same-origin frame as long as the creating document (this
 * one) stays alive, which it does here.
 */
export const PreviewPane: React.FC<{ config: StoryConfig }> = ({ config }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const url = URL.createObjectURL(new Blob([JSON.stringify(config)], { type: 'application/json' }));
      setBlobUrl(url);
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = url;
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  if (!blobUrl) return null;

  return (
    <Box sx={{ height: '100%' }}>
      <Box
        component="iframe"
        title="Story preview"
        src={`${import.meta.env.BASE_URL}preview.html?configPath=${encodeURIComponent(blobUrl)}`}
        sx={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </Box>
  );
};
