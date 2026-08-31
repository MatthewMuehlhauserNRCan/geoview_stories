# GeoView Story Library

A React-based storytelling library for creating interactive stories with GeoView maps, inspired by RAMP Storylines.

**📦 CDN Link:** `https://matthewmuehlhausernrcan.github.io/geoview_stories/geoview-story.js`  
**🌐 Demo:** [https://matthewmuehlhausernrcan.github.io/geoview_stories/demo/](https://matthewmuehlhausernrcan.github.io/geoview_stories/demo/)

## Features

- 📖 **Scroll-based storytelling** - Navigate through stories with smooth scrolling
- 🗺️ **GeoView integration** - Embed interactive maps with OpenLayers
- 📱 **Responsive design** - Works on desktop, tablet, and mobile
- 🎨 **Customizable panels** - Text, images, videos, maps, quotes, and interactive maps
- 🔗 **Auto-initialization** - Simple data-attribute-based setup
- 🎭 **Background images** - Full-page backgrounds with smooth crossfade transitions
- 📍 **Point of Interest navigation** - Automatic map zooming on scroll

## Quick Start

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

Story configurations are JSON files that define the structure and content. See `demo/configs/demo-story.json` for a complete example.

### Basic Structure

```json
{
  "title": "My Story",
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
- **image** - Display images with captions
- **video** - Embed YouTube or local videos
- **map** - Basic GeoView map
- **quote** - Styled quotations
- **interactive-map** - Map with scrollable points of interest

## Folder Structure

```
├── demo/               # Demo story files
│   ├── index.html     # Demo page
│   ├── configs/       # Story configurations
│   └── images/        # Story assets
├── dist/              # Built library (generated)
│   └── geoview-story.js
├── public/            # Static public files
│   └── index.html     # Library documentation
├── src/               # Source code
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks
│   ├── types/         # TypeScript types
│   ├── utils/         # Utilities
│   └── library.tsx    # Library entry point
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
