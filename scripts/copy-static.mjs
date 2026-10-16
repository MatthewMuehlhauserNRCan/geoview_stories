// Copies the non-bundled parts of the site (demo story, docs landing page, docsify reference)
// into dist/ after both vite builds have run. Runs last in `npm run build` so it can't be wiped
// by either build's own `emptyOutDir` (the lib build only empties dist/, the editor build only
// empties dist/editor/ - neither touches what this script writes).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const copies = [
  ['demo', 'demo'],
  ['public/index.html', 'index.html'],
  ['public/docs', 'docs'],
];

for (const [from, to] of copies) {
  fs.cpSync(path.join(root, from), path.join(dist, to), { recursive: true });
}

const favicon = path.join(root, 'public/favicon.ico');
if (fs.existsSync(favicon)) {
  fs.copyFileSync(favicon, path.join(dist, 'favicon.ico'));
}

// Bypasses GitHub Pages' Jekyll processing (which would otherwise ignore dotfiles/underscored paths).
fs.writeFileSync(path.join(dist, '.nojekyll'), '');

console.log('[copy-static] copied demo/, index.html, docs/, favicon.ico and wrote .nojekyll into dist/');
