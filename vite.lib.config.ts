import { defineConfig } from 'vite';
import path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// Builds src/index.tsx into the single UMD bundle (dist/geoview-story.js) that is this
// library's only public artifact - a plain <script> consumers drop into their own page (see
// demo/index.html). cssInjectedByJsPlugin inlines panels.css into the JS bundle itself (a <style>
// tag injected at runtime) instead of emitting a separate .css file, matching the previous
// webpack/style-loader setup where consumers only ever need the one script tag.
export default defineConfig(({ mode }) => ({
  plugins: [cssInjectedByJsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // React/MUI check `process.env.NODE_ENV` at runtime - webpack replaced this automatically via
  // its `mode` option, but a plain browser UMD bundle has no real `process` global, so without an
  // explicit replacement here it throws `ReferenceError: process is not defined` once loaded.
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'geoviewStory',
      formats: ['umd'],
      fileName: () => 'geoview-story.js',
    },
    rollupOptions: {
      // Matches the previous webpack `library.export: 'default'` - consumers get
      // `window.geoviewStory` as the default export directly, not `.default`.
      output: {
        exports: 'default',
      },
      // MUI ships "use client" directives for RSC frameworks - meaningless (and noisy) in a
      // plain bundled UMD script, so silence just that one warning code.
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
    },
    minify: mode === 'production' ? 'terser' : false,
    terserOptions:
      mode === 'production'
        ? {
            compress: {
              drop_console: true, // Remove all console.* statements, same as the old prod build
            },
          }
        : undefined,
  },
}));
