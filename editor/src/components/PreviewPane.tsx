import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import type { StoryConfig } from '@/types/StoryConfig';
import { resolveAssetRefs } from '../state/resolveAssetsForPreview';

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
 * one) stays alive, which it does here. Any `asset:<id>` references (uploaded files) are resolved
 * to their own fresh blob: URLs first, since only the exported config keeps the stable reference.
 */
export const PreviewPane: React.FC<{ config: StoryConfig }> = ({ config }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);
  const prevAssetUrlsRef = useRef<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollYRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      // Every edit forces a full reload below (StoryViewer only ever loads its configPath once
      // per mount - see preview-main.tsx) - capture where the user was before that happens so it
      // can be restored once the reloaded page is actually ready, instead of visually snapping
      // back to the top of the story on every keystroke.
      scrollYRef.current = iframeRef.current?.contentWindow?.scrollY ?? 0;

      const assetUrls: string[] = [];
      const resolved = await resolveAssetRefs(config, assetUrls);
      if (cancelled) {
        assetUrls.forEach((u) => URL.revokeObjectURL(u));
        return;
      }

      const url = URL.createObjectURL(new Blob([JSON.stringify(resolved)], { type: 'application/json' }));
      setBlobUrl(url);
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      prevAssetUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      prevUrlRef.current = url;
      prevAssetUrlsRef.current = assetUrls;
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [config]);

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      prevAssetUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  // preview-main.tsx posts this once the reloaded page has actually rendered (not just loaded) -
  // only then does restoring scroll land on the right content instead of an empty/partial page.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type !== 'geoview-story-preview-ready') return;
      iframeRef.current?.contentWindow?.scrollTo(0, scrollYRef.current);
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!blobUrl) return null;

  return (
    <Box sx={{ height: '100%' }}>
      <Box
        component="iframe"
        ref={iframeRef}
        title="Story preview"
        src={`${import.meta.env.BASE_URL}preview.html?configPath=${encodeURIComponent(blobUrl)}`}
        sx={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </Box>
  );
};
