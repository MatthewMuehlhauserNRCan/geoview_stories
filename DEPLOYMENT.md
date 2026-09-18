# GitHub Pages Deployment

This repo is a library - imported and used to build a GeoView Story, not an application in its own right. The GitHub Pages site built from it exists to distribute the package (the CDN-hosted `geoview-story.js`) and demonstrate it (the `demo/` story plus its config reference docs).

## Deploying

```bash
npm run build
npm run deploy
```

`webpack.common.js`'s `CopyWebpackPlugin` already copies `demo/`, `public/index.html`, and `public/docs/` into `dist/` alongside the built `geoview-story.js` (see [webpack.common.js](webpack.common.js)) - so after `npm run build`, `dist/` *is* the complete site, laid out exactly as it needs to be served. `npm run deploy` (`gh-pages -d dist`) pushes that folder's contents to the repo's `gh-pages` branch, with GitHub Pages configured (**Settings → Pages → Source: Deploy from a branch → `gh-pages`**) to serve it directly from there - no separate build/artifact step on GitHub's side. Always run `build` first; `deploy` on its own just republishes whatever is currently in `dist/`.

## Deployment Structure

After `npm run build`, `dist/` (and, after `npm run deploy`, the `gh-pages` branch) looks like:

```
dist/                       # = gh-pages branch root after deploy
├── geoview-story.js       # The library itself - what the CDN link points at
├── index.html             # Library landing/documentation page
├── docs/                  # Full configuration reference (docsify)
└── demo/                  # Demo story, showing the library in use
    ├── index.html
    ├── index_dark.html    # Same demo config, dark theme via data-theme
    ├── configs/           # Story configurations
    └── images/
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


## Local Development vs Production

- **Local development**: Use `npm run serve` (webpack dev server with hot reload)
- **Publishing the demo site**: `npm run build && npm run deploy`
