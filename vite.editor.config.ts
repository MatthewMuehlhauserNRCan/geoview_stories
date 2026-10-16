import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const editorRoot = path.resolve(__dirname, 'editor');

// Config builder - a separate app (its own index.html/preview.html, multi-page build) living
// under editor/, but sharing this project's single package.json/node_modules/toolchain so there's
// no more duplicate dependency tree (no react/@mui/@emotion dedupe hack needed) and no copy step
// to get its output into dist/ - it just builds straight into dist/editor.
export default defineConfig(({ command }) => ({
  root: editorRoot,
  // Relative base so editor/index.html's own asset links work wherever dist/editor/ is served
  // from (GitHub Pages subpath, a local static server, anywhere) - an absolute base would only
  // resolve at one specific deployed path.
  base: command === 'build' ? './' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/editor'),
    emptyOutDir: true,
    // Two pages: the editor UI itself, and the isolated preview page loaded via <iframe>.
    rollupOptions: {
      input: {
        main: path.resolve(editorRoot, 'index.html'),
        preview: path.resolve(editorRoot, 'preview.html'),
      },
    },
  },
}));
