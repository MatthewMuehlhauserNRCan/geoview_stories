# GitHub Pages Deployment

This repo is a library - imported and used to build a GeoView Story, not an application in its own right. The GitHub Pages site built from it exists to distribute the package (the CDN-hosted `geoview-story.js`) and demonstrate it (the `demo/` story plus its config reference docs).

## Deploying (GitHub Actions - automatic)

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and publishes the site automatically on every push to `main` (or via **Actions → Deploy to GitHub Pages → Run workflow** for a manual run). It runs the exact same `npm run build` used locally, then publishes the resulting `dist/` via GitHub's official Pages deployment action - no `gh-pages` branch, no local build/push step required.

**One-time setup:** in **Settings → Pages**, set **Source** to **GitHub Actions** (not "Deploy from a branch"). Until that's switched, this workflow will fail at the `actions/deploy-pages` step.

## Deploying manually (local fallback)

```bash
npm run build
npm run deploy
```

`npm run build` runs the library build, the editor build, and finally [scripts/copy-static.mjs](scripts/copy-static.mjs) (which copies `demo/`, `public/index.html`, and `public/docs/` into `dist/`) - so after it finishes, `dist/` *is* the complete site, laid out exactly as it needs to be served. `npm run deploy` (`gh-pages -d dist`) pushes that folder's contents to the repo's `gh-pages` branch. This only works if **Settings → Pages → Source** is set to **Deploy from a branch → `gh-pages`** - i.e. it's an alternative to the Actions workflow above, not a complement to it, since GitHub Pages can only serve from one source at a time. Always run `build` first; `deploy` on its own just republishes whatever is currently in `dist/`.

### Including the Config Builder


The [editor/](editor/) config builder shares this project's single `package.json`/Vite toolchain (its own source + [vite.editor.config.ts](vite.editor.config.ts), no separate install/build project) and is included automatically - `npm run build` runs the library build, then the editor build, then copies `demo/`/`public/` into `dist/`, in that order, every time. There's no separate step and no ordering to remember; just:

```bash
npm run build
npm run deploy
```

## Deployment Structure

After `npm run build`, `dist/` (and, after `npm run deploy`, the `gh-pages` branch) looks like:

```
dist/                       # = gh-pages branch root after deploy
├── geoview-story.js       # The library itself - what the CDN link points at
├── index.html             # Library landing/documentation page
├── docs/                  # Full configuration reference (docsify)
├── demo/                  # Demo story, showing the library in use
│   ├── index.html
│   ├── index_dark.html    # Same demo config, dark theme via data-theme
│   ├── configs/           # Story configurations
│   └── images/
└── editor/                # Config builder - built automatically by `npm run build`
```

## Custom Domain (Optional)

To use a custom domain:
1. Go to **Settings** → **Pages**
2. Enter your custom domain under **Custom domain**
3. Add a CNAME record in your DNS settings pointing to `[username].github.io`

If deploying via the **GitHub Actions** source (above), GitHub writes the `CNAME` file into the Pages deployment for you from this setting, same as it would on a `gh-pages` branch - no repo changes needed either way.

## Troubleshooting

### Demo Not Working

If the demo doesn't work on GitHub Pages:
- Verify paths in `demo/index.html` are correct
- Check browser console for errors
- Ensure `dist/geoview-story.js` exists after `npm run build`

### Pages Not Updating

If changes aren't reflected after a deploy:
- Clear your browser cache
- Wait a few minutes for GitHub to rebuild
- Check the **Actions** tab for a failed workflow run (if using the Actions source), or confirm **Settings → Pages → Source** matches whichever method you're actually using

### "Config Builder" Link Not Working

- **Locally, via `npm run serve`**: expected - the dev server serves the whole repo root as static files, so it serves the raw, uncompiled `editor/index.html` straight off disk rather than the built `dist/editor/` (a different URL entirely). Use `npm run dev:editor` and go to `localhost:5173` directly instead, or serve `dist/` itself as a plain static site (e.g. `npx serve dist`) to test the real built link. See [editor/README.md](editor/README.md).
- **On the deployed site**: shouldn't happen anymore - `npm run build` always builds the editor too. If it's still missing, check the build output for an editor build error before deploying.

## Local Development vs Production

- **Local development**: Use `npm run serve` (rebuilds the library on change, serves the repo root statically, port 3000)
- **Config builder development**: `npm run dev:editor` (Vite dev server with real HMR, port 5173 - see [editor/README.md](editor/README.md))
- **Publishing the demo site**: push to `main` (Actions deploys automatically), or `npm run build && npm run deploy` if using the manual/branch-based fallback instead
