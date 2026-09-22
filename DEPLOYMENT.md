# GitHub Pages Deployment

This repo is a library - imported and used to build a GeoView Story, not an application in its own right. The GitHub Pages site built from it exists to distribute the package (the CDN-hosted `geoview-story.js`) and demonstrate it (the `demo/` story plus its config reference docs).

## Deploying

```bash
npm run build
npm run deploy
```

`webpack.common.js`'s `CopyWebpackPlugin` already copies `demo/`, `public/index.html`, and `public/docs/` into `dist/` alongside the built `geoview-story.js` (see [webpack.common.js](webpack.common.js)) - so after `npm run build`, `dist/` *is* the complete site, laid out exactly as it needs to be served. `npm run deploy` (`gh-pages -d dist`) pushes that folder's contents to the repo's `gh-pages` branch, with GitHub Pages configured (**Settings → Pages → Source: Deploy from a branch → `gh-pages`**) to serve it directly from there - no separate build/artifact step on GitHub's side. Always run `build` first; `deploy` on its own just republishes whatever is currently in `dist/`.

### Including the Config Builder

The [editor/](editor/) config builder is a separate app (its own `package.json`/Vite build, never wired into the commands above) - if you want it included in the deployed site, build it too, **in this exact order**:

```bash
npm run build              # 1. Root project first - populates dist/
cd editor
npm run build               # 2. Builds the editor AND copies its output into ../dist/editor
cd ..
npm run deploy              # 3. Publishes dist/, now including dist/editor/
```

Build root first so `../dist` exists for the editor's build to copy into (its build script checks for this and fails loudly rather than silently doing nothing). After that, `dist/editor/` survives any further root rebuilds - `webpack.common.js`'s `output.clean` explicitly excludes `editor/` (`clean: { keep: /^editor\// }`) precisely because a plain `clean: true` would otherwise wipe it on every subsequent `npm run build` *or* `npm run serve` (the dev server also recompiles - and cleans - on startup). Re-run the editor's own `npm run build` any time you change the editor itself; a root rebuild alone won't touch it either way. See [editor/README.md](editor/README.md) for details on the editor itself.

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
└── editor/                # Config builder - only present if you also built editor/ (see above)
```

## Custom Domain (Optional)

To use a custom domain:
1. Go to **Settings** → **Pages**
2. Enter your custom domain under **Custom domain** - GitHub writes/maintains the `CNAME` file on the `gh-pages` branch for you from this setting, so it survives every future `npm run deploy`
3. Add a CNAME record in your DNS settings pointing to `[username].github.io`

## Troubleshooting

### Demo Not Working

If the demo doesn't work on GitHub Pages:
- Verify paths in `demo/index.html` are correct
- Check browser console for errors
- Ensure `dist/geoview-story.js` exists after `npm run build`

### Pages Not Updating

If changes aren't reflected after `npm run deploy`:
- Clear your browser cache
- Wait a few minutes for GitHub to rebuild
- Check the repo's **Settings → Pages** to confirm the source is still set to the `gh-pages` branch

### "Config Builder" Link Not Working

- **Locally, via `npm run serve`**: expected, and not fixable by building the editor - the dev server serves the whole repo root as static files, so it always serves the raw, uncompiled `editor/index.html` straight off disk rather than the built `dist/editor/` (a different URL entirely). Use `cd editor && npm run dev` and go to `localhost:5173` directly instead, or serve `dist/` itself as a plain static site (e.g. `npx serve dist`) to test the real built link. See [editor/README.md](editor/README.md).
- **On the deployed site**: the editor wasn't built/copied in before the last deploy - see "Including the Config Builder" above.



## Local Development vs Production

- **Local development**: Use `npm run serve` (webpack dev server with hot reload)
- **Config builder development**: `cd editor && npm run dev` (separate Vite dev server, port 5173 - see [editor/README.md](editor/README.md))
- **Publishing the demo site**: `npm run build && npm run deploy`
