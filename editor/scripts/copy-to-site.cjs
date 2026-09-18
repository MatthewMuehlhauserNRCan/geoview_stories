// Copies this app's own build output into the main project's dist/editor/, so the root's
// `npm run deploy` (gh-pages -d dist, unchanged) publishes it alongside the rest of the site.
// Self-contained here in editor/ - the root package.json/webpack config are never touched.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'dist');
const dest = path.join(__dirname, '..', '..', 'dist', 'editor');

if (!fs.existsSync(src)) {
  console.warn('[copy-to-site] editor/dist not found - did `vite build` run first?');
  process.exit(1);
}

if (!fs.existsSync(path.join(__dirname, '..', '..', 'dist'))) {
  console.warn(
    "[copy-to-site] ../../dist doesn't exist yet - run the root project's `npm run build` BEFORE `npm run build` here, " +
      'otherwise its own build (output.clean: true) will wipe this copy out again.'
  );
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log(`[copy-to-site] Copied editor/dist -> ${path.relative(process.cwd(), dest)}`);
