# Config Builder (Editor)

A standalone visual config builder for GeoView Story configs: a form-based editor for `StoryConfig` (slides, panels, theming) with a live preview of the current draft alongside it.

This is a fully separate app from the main library - it has its own `package.json`, dependencies, and build tooling (Vite), and is never wired into the root project's `package.json` scripts or webpack config. It imports the main library's `../src` directly (types, the real `StoryViewer` component, and a couple of `StoryStore` functions) so the preview is genuinely the same rendering code the library ships, not a reimplementation.

## Development

```bash
cd editor
npm install
npm run dev
```

Open **http://localhost:5173/**.

> This only works via the editor's own dev server. If you're running the main library's dev server (`npm run serve` at the repo root, port 3000) and click the "Config Builder" link from the docs landing page, it will 404 - webpack's dev server serves raw repo files as static assets and has no way to run Vite's dev pipeline against `editor/src`'s TypeScript. That link only resolves once the editor has been *built* (see below) and its output copied alongside the deployed site. During active editor development, always go to `localhost:5173` directly.

## Building for deployment

```bash
# From the repo root:
npm run build              # 1. Build the main library first - populates dist/
cd editor
npm run build               # 2. Build the editor, then copy its output into ../dist/editor
cd ..
npm run deploy              # 3. Publish dist/ (now including dist/editor/) as usual
```

**Order matters.** The root webpack config has `output.clean: true`, so root's own `npm run build` wipes `dist/` on every run. If you build the editor *before* the root project, the root build will delete `dist/editor/` again. Always build root first, editor second.

`npm run build` inside `editor/` runs `vite build` and then `scripts/copy-to-site.cjs`, which copies `editor/dist/` into the root project's `dist/editor/` - so it rides along with the existing `npm run deploy` (`gh-pages -d dist`) unchanged. If `../dist` doesn't exist yet when the copy script runs, it fails loudly with a reminder to build the root project first, rather than silently doing nothing.

## Architecture notes

- **Live preview**: the draft `StoryConfig` is serialized to a `Blob`, given an object URL, and loaded into an `<iframe>` pointed at `preview.html?configPath=<blob url>` (debounced ~600ms after the last edit). `preview.html` is a second, minimal Vite entry point that just mounts the real `StoryViewer` full-page, reading `configPath` from the query string - `loadStoryConfig`'s plain `fetch(configPath)` works against a `blob:` URL exactly like a real file, so no changes to the library's loading code were needed.
- **Why an iframe, not a directly-embedded `<StoryViewer>`**: `StoryViewer`'s table of contents uses a MUI `Drawer`, which portals to `document.body` regardless of where `StoryViewer` itself is mounted in the tree - embedding it directly inside a smaller pane made it overlay the entire editor UI instead of staying confined to its own pane. An iframe gives it a real, isolated viewport.
- **Map panels**: `config` (the GeoView map config path) is just a text field here - it can be left as a placeholder until a real map config JSON exists. That one map panel will show its own loading state in the preview until then; it won't break the rest of the story.
- **Module duplication**: because `editor/src` files and imported `../src` files sit in different directories, Node/Vite's default resolution would otherwise load two separate copies of `react`/`@mui/material`/`@emotion/react` (one from `editor/node_modules`, one from the root project's `node_modules`), which breaks MUI's styling entirely (props leaking onto raw DOM nodes). `vite.config.ts`'s `resolve.dedupe` forces everything to resolve to the editor's own copies.
- **`base` path**: the production build sets `base: '/geoview_stories/editor/'` (matching `webpack.prod.js`'s own `publicPath` for the main site) so built asset URLs resolve correctly once deployed under that subpath. The dev server still serves from `/`. The preview iframe's own URL is built from `import.meta.env.BASE_URL`, not a hardcoded `/preview.html`, for the same reason.

## Known limitations

- `AutoPoiMapPanel.filter` (which subset of a layer's features become POIs) isn't editable in the UI yet - import/edit that field via a raw JSON file if you need it.
- `HeadingStyle`'s border/underline sub-objects (custom width/color/thickness) aren't exposed - only the boolean on/off form is.
- No drag-and-drop reordering yet (slides/panels/rows use up/down/left/right buttons instead).
- Editing an existing story assumes it's a single JSON file - `contentFile`-based text panels and other file-path fields are edited as plain text paths, not resolved/previewed inline.
