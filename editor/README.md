# Config Builder (Editor)

A standalone visual config builder for GeoView Story configs: a form-based editor for `StoryConfig` (slides, panels, theming) with a live preview of the current draft alongside it.

This app shares the root project's single `package.json`/`node_modules`/Vite toolchain - it has its own source (`editor/src`) and its own Vite config ([vite.editor.config.ts](../vite.editor.config.ts) at the repo root), but there's no separate install step or dependency tree to keep in sync. It imports the main library's `../src` directly (types, the real `StoryViewer` component, and a couple of `StoryStore` functions) so the preview is genuinely the same rendering code the library ships, not a reimplementation.

## Development

From the repo root:

```bash
npm install
npm run dev:editor
```

Open **http://localhost:5173/**.

> This only works via the editor's own dev server (`dev:editor`, real Vite HMR). The main library's dev server (`npm run serve`, port 3000) just serves the whole repo root as static files for the `demo/` story - it serves the raw, uncompiled `editor/index.html` straight off disk rather than a built bundle, so a "Config Builder" link clicked from there will 404. Always use `localhost:5173` directly during editor development.

## Building for deployment

```bash
# From the repo root:
npm run build       # builds the library, the editor, and copies demo/public into dist/
npm run deploy       # publishes dist/ (including dist/editor/) as usual
```

One `npm run build` does everything, in the right order automatically - no separate editor build step, no copy script, and no "build root first" ordering requirement to remember.

## Architecture notes

- **Live preview**: the draft `StoryConfig` is serialized to a `Blob`, given an object URL, and loaded into an `<iframe>` pointed at `preview.html?configPath=<blob url>` (debounced ~600ms after the last edit). `preview.html` is a second, minimal Vite entry point that just mounts the real `StoryViewer` full-page, reading `configPath` from the query string - `loadStoryConfig`'s plain `fetch(configPath)` works against a `blob:` URL exactly like a real file, so no changes to the library's loading code were needed.
- **Why an iframe, not a directly-embedded `<StoryViewer>`**: `StoryViewer`'s table of contents uses a MUI `Drawer`, which portals to `document.body` regardless of where `StoryViewer` itself is mounted in the tree - embedding it directly inside a smaller pane made it overlay the entire editor UI instead of staying confined to its own pane. An iframe gives it a real, isolated viewport.
- **Map panels**: `config` (the GeoView map config path) can be a plain path/URL, or a file can be attached to it the same way as image/video assets - it's just tracked (shown by filename), never fed into the live preview. A GeoView map config is a whole separate schema this editor doesn't author, so the map panel always shows its own loading placeholder regardless of whether a real path, an attached file, or nothing at all is set.
- **Module duplication**: no longer a concern - the editor shares the root project's single `node_modules`, so `editor/src` and `../src` always resolve the exact same copy of `react`/`@mui/material`/`@emotion/react`.
- **`base` path**: the production build uses a *relative* base (`base: './'`), not a hardcoded absolute path - the editor's own `index.html`/`preview.html` always load their own assets from wherever they themselves end up being served (the real GitHub Pages path, a local test folder, anywhere), so hardcoding one specific deployed path would only work at that exact path and 404 everywhere else. The dev server still serves from `/`. The preview iframe's own URL is built from `import.meta.env.BASE_URL` (so it inherits the same relative resolution), not a hardcoded `/preview.html`.
- **Uploaded assets (images/videos/markdown)**: image, video, and text-`contentFile` fields have an "Upload" option alongside the plain URL/path text box. Uploaded files are stored in IndexedDB (survives reloads, unlike a `blob:` URL) and referenced from the draft config as a stable `asset:<id>` string - never a URL, since a `blob:` URL wouldn't survive a reload and couldn't mean anything outside this browser anyway. The live preview resolves each `asset:<id>` to a fresh `blob:` URL only at preview time (`resolveAssetsForPreview.ts`). Since `asset:<id>` isn't a real path once you leave the editor, **Export** automatically switches to a `.zip` (via `jszip`) whenever the config references any uploaded asset - `story-config.json` plus an `assets/` folder, with paths already rewritten to match - instead of a lone `.json` file.
- **Linked map configs**: map panels' `config` field can attach a file the same way (`AssetField` with `kind="mapconfig"`), using a distinct `mapconfig:<id>` reference so the resolver in `resolveAssetsForPreview.ts` (which only ever touches `asset:` refs) deliberately leaves it alone - the map just shows its normal loading placeholder, same as an empty path, while the field itself still shows which file is attached.
- **Import isn't limited to our own zip layout**: any zip works, not just one this tool exported - e.g. zip up an existing story's own `configs/` + `images/` folder pair as-is, including any map config JSON files alongside it. On import, every string field that matches a real file in the zip (resolved relative to wherever the chosen config `.json` sits inside the zip, falling back to the zip root) is rehydrated: a matched `.json` file becomes a linked map config (`mapconfig:<id>`), anything else becomes a regular uploaded asset (`asset:<id>`). There's no required `assets/` folder name or fixed layout - same-directory and subdirectory-relative paths both resolve, and zip entry names are normalized to forward slashes first (some zip tools, e.g. Windows' `Compress-Archive`, write backslash-separated names).
- **Multiple `.json` files in one zip**: if none is named `story-config.json` and there's more than one, a dialog asks which one is the actual story to import - the others are just made available for other fields (typically a map's `config`) to match against, not parsed as the story itself.

## Known limitations

- `AutoPoiMapPanel.filter` (which subset of a layer's features become POIs) isn't editable in the UI yet - import/edit that field via a raw JSON file if you need it.
- `HeadingStyle`'s border/underline sub-objects (custom width/color/thickness) aren't exposed - only the boolean on/off form is.
- No drag-and-drop reordering yet (slides/panels/rows use up/down/left/right buttons instead).
- Linked map configs are tracked but never actually loaded in the preview - a GeoView map config is a whole separate schema/renderer this editor doesn't drive, so there's no in-editor map preview even once a file is attached.
