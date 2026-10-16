# GitHub Pages Deployment

This repo is a library - imported and used to build a GeoView Story, not an application in its own right. The GitHub Pages site built from it exists to distribute the package (the CDN-hosted `geoview-story.js`) and demonstrate it (the `demo/` story plus its config reference docs).

## Deploying

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and publishes the site automatically on every push to `main` (or via **Actions → Deploy to GitHub Pages → Run workflow** for a manual run). It runs the exact same `npm run build` used locally - the library build, the editor build, then [scripts/copy-static.mjs](scripts/copy-static.mjs) (which copies `demo/`, `public/index.html`, and `public/docs/` into `dist/`) - then publishes the resulting `dist/` via GitHub's official Pages deployment action. There's no branch to push to and no local build/deploy step required; `dist/` is also gitignored, since it only ever needs to exist as a CI build artifact or a local, disposable preview.

**One-time setup:** in **Settings → Pages**, set **Source** to **GitHub Actions**.

### Including the Config Builder

The [editor/](editor/) config builder shares this project's single `package.json`/Vite toolchain (its own source + [vite.editor.config.ts](vite.editor.config.ts), no separate install/build project) and is included automatically - `npm run build` runs the library build, then the editor build, then copies `demo/`/`public/` into `dist/`, in that order, every time. There's no separate step and no ordering to remember.

## Deployment Structure

After `npm run build` (locally, or as run by the Actions workflow), `dist/` looks like:

```
dist/                       # = what gets published to GitHub Pages
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
2. Enter your custom domain under **Custom domain** - GitHub writes the `CNAME` file into the Pages deployment for you from this setting, so it survives every future deploy
3. Add a CNAME record in your DNS settings pointing to `[username].github.io`

## Troubleshooting

### Demo Not Working

If the demo doesn't work on GitHub Pages:
- Verify paths in `demo/index.html` are correct
- Check browser console for errors
- Check the **Actions** tab for a failed workflow run

### Pages Not Updating

If changes aren't reflected after a deploy:
- Clear your browser cache
- Wait a few minutes for GitHub to rebuild
- Check the **Actions** tab for a failed workflow run

### "Config Builder" Link Not Working

- **Locally, via `npm run serve`**: expected - the dev server serves the whole repo root as static files, so it serves the raw, uncompiled `editor/index.html` straight off disk rather than the built `dist/editor/` (a different URL entirely). Use `npm run dev:editor` and go to `localhost:5173` directly instead, or serve `dist/` itself as a plain static site (e.g. `npx serve dist`) to test the real built link. See [editor/README.md](editor/README.md).
- **On the deployed site**: shouldn't happen - `npm run build` always builds the editor too. If it's still missing, check the Actions run's build step for an editor build error.

## Local Development vs Production

- **Local development**: Use `npm run serve` (rebuilds the library on change, serves the repo root statically, port 3000)
- **Config builder development**: `npm run dev:editor` (Vite dev server with real HMR, port 5173 - see [editor/README.md](editor/README.md))
- **Publishing the demo site**: push to `main` - Actions builds and deploys automatically
