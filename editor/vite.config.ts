import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Standalone app - imports the main library's ../src directly (types, StoryViewer, StoryStore
// setters) for real, but has its own build/dev server entirely decoupled from the root
// package.json/webpack config, per project convention: this tool must not require touching those.
export default defineConfig(({ command }) => ({
  // Relative, not a hardcoded absolute path - the editor's own index.html/preview.html always
  // load their own assets from wherever THEY are served, whether that's the real GitHub Pages
  // path (.../geoview_stories/editor/), a local test folder, or anywhere else. An absolute base
  // would only resolve correctly at one specific deployed path, breaking every other case.
  base: command === 'build' ? './' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
    // Without this, files under ../src resolve react/@mui/@emotion against the ROOT project's
    // node_modules (found by walking up from their own physical location) while editor/src files
    // resolve the same packages against editor/node_modules - two separate instances of
    // @emotion/react in one bundle breaks MUI's styling entirely (props leak onto raw DOM nodes).
    dedupe: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
  },
  server: {
    port: 5173,
  },
  build: {
    // Two pages: the editor UI itself, and the isolated preview page loaded via <iframe>.
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        preview: path.resolve(__dirname, 'preview.html'),
      },
    },
  },
}));
