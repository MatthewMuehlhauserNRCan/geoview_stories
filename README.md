# GeoView Story Library

A React-based storytelling library for creating interactive stories with GeoView maps, inspired by RAMP Storylines.

**📦 CDN Link:** `https://matthewmuehlhausernrcan.github.io/geoview_stories/geoview-story.js`  
**🌐 Demo:** [https://matthewmuehlhausernrcan.github.io/geoview_stories/demo/](https://matthewmuehlhausernrcan.github.io/geoview_stories/demo/)  
**📄 Template:** [demo/index.html](demo/index.html)

## Features

- 📖 **Scroll-based storytelling** - Navigate through stories with smooth scrolling
- 🗺️ **GeoView integration** - Embed interactive maps with OpenLayers
- 📱 **Responsive design** - Works on desktop, tablet, and mobile
- 🎨 **Customizable panels** - Text, images, videos, maps, quotes, image galleries, and interactive maps
- 🌗 **Theming** - Built-in light/dark themes, fully custom themes, or a `data-theme` HTML attribute to reuse one config across multiple pages
- 🔗 **Auto-initialization** - Simple data-attribute-based setup
- 🎭 **Background images** - Full-page backgrounds with smooth crossfade transitions
- 🖼️ **Image galleries** - Carousel with optional side-positioned captions and a full-screen lightbox
- 📍 **Point of interest navigation** - Automatic map zooming/panning on scroll, by scale or explicit zoom level
- ♿ **Accessibility** - Keyboard-navigable focus management, ARIA labeling, and WCAG-conscious layout choices throughout

## Quick Start

### Using the Template

The easiest way to get started is to copy the [`demo/`](demo/) folder (`index.html`, `configs/`, `images/`) as a starting template — it's self-contained and can be dropped onto any static host as-is. `demo/index.html` includes all the necessary setup with comments explaining each step.

### Option 1: Auto-Init (Recommended)

Include the library directly from GitHub Pages:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 1. Include GeoView (required for map panels) -->
  <script src="https://canadian-geospatial-platform.github.io/geoview/public/cgpv-main.js"></script>
</head>
<body>
  <!-- 2. Add a container with class and data-config -->
  <div 
    class="geoview-story" 
    data-config="path/to/story-config.json"
  ></div>

  <!-- 3. Include GeoView Story library from GitHub Pages -->
  <script src="https://matthewmuehlhausernrcan.github.io/geoview_stories/geoview-story.js"></script>
</body>
</html>
```

### Option 2: Manual Initialization

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://canadian-geospatial-platform.github.io/geoview/public/cgpv-main.js"></script>
</head>
<body>
  <div id="my-story"></div>

  <script src="https://matthewmuehlhausernrcan.github.io/geoview_stories/geoview-story.js"></script>
  <script>
    // Initialize when ready
    window.geoviewStory.init('my-story', 'path/to/story-config.json');
  </script>
</body>
</html>
```

### Option 3: Local Development

If you're developing locally or want to self-host:

```html
<script src="dist/geoview-story.js"></script>
```

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run serve
```

This starts the dev server at `http://localhost:3000` with:
- `/` - Library documentation page
- `/demo/` - Demo story

### Build Library

```bash
npm run build
```

Outputs `dist/geoview-story.js` - a bundled library ready for distribution.

### Preview Deployment (like GeoView's "rush host")

```bash
npm run host
```

This builds the library and serves it locally at `http://localhost:3001` in the same structure as GitHub Pages. Perfect for testing before deployment.

## GitHub Pages Deployment

This repository is configured for automatic deployment to GitHub Pages.

### Quick Setup

1. Push your code to GitHub
2. Go to **Settings** → **Pages** → Set source to **GitHub Actions**
3. Push to `main` branch triggers automatic deployment
4. Your site will be at `https://[username].github.io/[repo-name]/`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Configuration

Story configurations are JSON files that define the structure and content. See `demo/configs/demo-story.json` for a complete example, and [public/docs.html](public/docs.html) (or the [live reference page](https://matthewmuehlhausernrcan.github.io/geoview_stories/docs.html)) for the full field-by-field reference, including options not shown in the demo (custom themes, POI `field`/`zoom` overrides, video `autoplay`/`transcript`, gallery `objectFit`, etc.).

### Basic Structure

```json
{
  "introSlide": {
    "title": "Welcome",
    "subtitle": "Scroll to begin",
    "backgroundImage": "images/hero.jpg"
  },
  "slides": [
    {
      "title": "First Slide",
      "backgroundImage": "images/background.jpg",
      "panel": [
        {
          "type": "text",
          "title": "Hello World",
          "content": "# Markdown content here",
          "cssClasses": "left-align"
        }
      ]
    }
  ]
}
```

### Panel Types

- **text** - Markdown content with optional CSS classes
- **image** - Displays images with captions; click (or Enter/Space) opens a full-screen view unless `fullscreen: false` is set
- **video** - Embed YouTube, local, or external videos, with optional autoplay, caption, and transcript link
- **map** - Basic GeoView map
- **quote** - Styled quotations with attribution
- **slideshow** - Image gallery carousel with dot navigation, optional side-positioned caption text per image, a full-screen viewer, and a configurable `objectFit`
- **interactive-map** - Map with scrollable points of interest; each POI can zoom to a feature's extent by scale or explicit zoom level, or return to the map's home view
- **dynamic** - Reserved in the schema for a future composable panel type; not yet implemented

### Theming

A story can select a built-in theme by name, or define its own:

```json
{
  "theme": "dark",
  "slides": [ /* ... */ ]
}
```

```json
{
  "theme": {
    "name": "dark",
    "primaryColor": "#ff6b35",
    "geoviewTheme": "canada.ca"
  }
}
```

Built-in themes are `light` (default) and `dark`. A custom theme object can set `mode`, `primaryColor`, `secondaryColor`, `backgroundColor`, `paperColor`, `textColor`, `fontFamily`, and `geoviewTheme` (which GeoView map theme to sync to - GeoView only understands `dark`/`light`/`geo.ca`/`canada.ca`, so it's inferred from `mode` unless set explicitly).

To reuse the exact same config file with a different theme (e.g. a `_dark` variant of a page) without duplicating it, add a `data-theme` attribute to the container element instead of touching the JSON - see `demo/index_dark.html` for a working example that reuses `demo/configs/demo-story.json` as-is:

```html
<div class="geoview-story" data-config="configs/demo-story.json" data-theme="dark"></div>
```

## Folder Structure

```
├── demo/               # Demo story files
│   ├── index.html     # Demo page
│   ├── index_dark.html # Same demo config, dark theme via data-theme
│   ├── configs/       # Story configurations
│   └── images/        # Story assets
├── dist/              # Built library (generated)
│   └── geoview-story.js
├── public/            # Static public files
│   ├── index.html     # Library landing/documentation page
│   └── docs.html      # Full configuration reference
├── src/               # Source code
│   ├── components/    # React components (layout/, panels/, story/)
│   ├── core/          # Non-React controllers and stores
│   ├── hooks/         # Custom hooks
│   ├── theme/         # Theme dictionary and builder
│   ├── types/         # TypeScript types
│   ├── utils/         # Utilities
│   └── index.tsx      # Library entry point
└── webpack.*.js       # Build configuration
```

## API Reference

### window.geoviewStory.init(containerId, configPath)

Initialize a story viewer in a container.

**Parameters:**
- `containerId` (string) - ID of the HTML element
- `configPath` (string) - Path to story JSON config

**Example:**
```javascript
window.geoviewStory.init('story-container', 'configs/my-story.json');
```

### window.geoviewStory.destroy(containerId)

Destroy a story viewer instance.

**Parameters:**
- `containerId` (string) - ID of the container to destroy

**Example:**
```javascript
window.geoviewStory.destroy('story-container');
```

### window.geoviewStory.autoInit()

Manually trigger auto-initialization (scans for `.geoview-story` elements).

**Example:**
```javascript
window.geoviewStory.autoInit();
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

MIT

## Credits

Built with:
- React 19
- Material-UI v9
- GeoView (OpenLayers)
- TypeScript
- Webpack
