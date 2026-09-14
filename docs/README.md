# Configuration Reference

Complete reference for GeoView Story Library config JSON files: story structure, theming, and every panel type.

> Quick Start: See the [README](https://github.com/MatthewMuehlhauserNRCan/geoview_stories#readme) for setup instructions, and the [demo](../demo/) for a full working example.

> Fields marked **Not shown in demo** below aren't exercised by `demo/configs/demo-story.json`, so this page is the only place they're documented.

## Table of Contents

- [Story Config](#story-config)
- [Theming](#theming)
- [Intro Slide](#intro-slide)
- [Slides](#slides)
- [Panel Types](#panel-types)
  - [text](#text)
  - [image](#image)
  - [video](#video)
  - [map](#map)
  - [quote](#quote)
  - [slideshow](#slideshow)
  - [interactive-map](#interactive-map)
  - [doormat](#doormat)
  - [dynamic (reserved)](#dynamic-reserved)

## Story Config

The root configuration object for a story.

```ts
interface StoryConfig {
  // Optional
  introSlide?: IntroSlide;
  tocOrientation?: "vertical" | "horizontal"; // default "vertical"
  theme?: string | StoryThemeConfig;
  tableOfContents?: TocItem[];
  tocHeading?: string; // default "Chapters"
  lang?: "en" | "fr"; // default "en"

  // Required
  slides: Slide[];
}

interface TocItem {
  title: string;
  slideIndex?: number;   // Local entry that scrolls to this slide. Omit for an external link or group label.
  href?: string;          // External entry that navigates to another page. Mutually exclusive with slideIndex.
  sublist?: Array<{ title: string; slideIndex: number }>; // One level of grouping under this entry.
}
```

An entry with neither `slideIndex` nor `href` (just a `title` and a `sublist`) renders as a plain, non-clickable group label - useful for grouping a whole page's entries under one heading (e.g. a language name) alongside sibling `href` links to other pages.

### Properties

- **`introSlide`** (Optional): Full-screen intro shown before the first slide. See [Intro Slide](#intro-slide).
- **`slides`** (Required): Array of slides that make up the story. See [Slides](#slides).
- **`tocOrientation`** (Optional): Table of contents layout. Default `"vertical"`.
- **`theme`** (Optional): Built-in theme name, or a custom theme object. See [Theming](#theming). **Custom theme objects and `geoviewTheme` not shown in demo config** (the demo instead uses the `data-theme` HTML attribute).
- **`tableOfContents`** (Optional): Explicit override of the auto-derived TOC (which otherwise lists one entry per slide, skipping any with `includeInToc: false`). Lets you relabel entries independently of the slide's own title, group several slides under one heading via `sublist`, and mix in links to other pages (`href`) at whatever position matches your site's overall navigation order - useful for a shared TOC across multiple themed story pages, where the current page's section is expanded (`sublist`) and sibling pages are plain links. See the [French demo](../demo/index_fr.html) for a working example (each language links to the other via `href`).
- **`tocHeading`** (Optional): TOC panel heading. Default `"Chapters"` - override for other languages (e.g. `"Chapitres"`).
- **`lang`** (Optional): Drives the GeoView map viewer's own UI language (`data-lang` on each map element). Default `"en"`. GeoView map configs are already bilingual internally, so a single `config` JSON works for both languages - no need for separate French map configs.

### Example: `tableOfContents`

```json
{
  "tocHeading": "Chapters",
  "tableOfContents": [
    { "title": "Introduction", "slideIndex": 0 },
    {
      "title": "Project Summaries",
      "slideIndex": 3,
      "sublist": [
        { "title": "Community A", "slideIndex": 4 },
        { "title": "Community B", "slideIndex": 5 }
      ]
    },
    { "title": "Français", "href": "index_fr.html" }
  ]
}
```

Each entry is either local (`slideIndex`, scrolls within the page - optionally with one level of `sublist`) or external (`href`, navigates to another page, rendered with an external-link icon and never highlighted as active). Both kinds can be freely mixed in the same array, in whatever order matches your site's overall navigation - this is what makes a cross-page link (a language switch, a link to a sibling "theme" page, etc.) sit at the right position relative to the current page's own entries.

> See the [French demo](../demo/index_fr.html) for this pattern working end-to-end: `demo/configs/demo-story.json` and `demo/configs/demo-story-fr.json` each end their `tableOfContents` with a link to the other language, and share the same `Slide.id` per slide so deep links (e.g. `#3-basic-map`) resolve correctly after following the link.

## Theming

Select a built-in theme by name:

```json
{ "theme": "dark" }
```

Or fully customize (optionally based on a named theme via `name`):

```json
{
  "theme": {
    "name": "dark",
    "mode": "dark",
    "primaryColor": "#ff6b35",
    "secondaryColor": "#00bcd4",
    "backgroundColor": "#121212",
    "paperColor": "#1e1e1e",
    "textColor": "#ffffff",
    "fontFamily": "'Georgia', serif",
    "geoviewTheme": "canada.ca"
  }
}
```

```ts
interface StoryThemeConfig {
  name?: string;         // Built-in theme to use as a base ("light" or "dark"); other fields override it
  mode?: "light" | "dark";
  primaryColor?: string;   // CSS color
  secondaryColor?: string; // CSS color
  backgroundColor?: string; // Page background, CSS color
  paperColor?: string;      // Card/panel background, CSS color
  textColor?: string;       // Primary text color, CSS color
  fontFamily?: string;      // CSS font-family stack
  geoviewTheme?: "dark" | "light" | "geo.ca" | "canada.ca";
}
```

Built-in themes: `"light"` (default), `"dark"`.

`geoviewTheme` is which GeoView map theme to sync to. GeoView only understands these 4 fixed names, so a custom app theme's look can't always be inferred automatically - set this explicitly if the auto-guess (based on `mode`) isn't what you want.

### Reusing One Config With a Different Theme

Rather than duplicating a config file just to get a themed variant of a page, add a `data-theme` attribute to the story container. It overrides whatever `theme` (if any) is set in the JSON:

```html
<div class="geoview-story" data-config="configs/my-story.json" data-theme="dark"></div>
```

See `demo/index_dark.html`, which reuses `demo/configs/demo-story.json` unmodified.

## Intro Slide

```ts
interface IntroSlide {
  // Required
  title: string;

  // Optional
  subtitle?: string;
  backgroundImage?: string;
  scrimOpacity?: number; // 0-1, default 0.4
  logo?: { src: string; altText: string };
}
```

### Properties

- **`title`** (Required): Main heading.
- **`subtitle`** (Optional): Shown below the title.
- **`backgroundImage`** (Optional): Full-bleed hero image.
- **`scrimOpacity`** (Optional): Darkening applied over `backgroundImage` so the title/subtitle stay readable (WCAG contrast). Default `0.4`. Tune it down for images that are already dark, or up for busier/brighter ones. **Not shown in demo.**
- **`logo`** (Optional): `{ src, altText }` image shown above the title.

## Slides

```ts
interface Slide {
  // Required
  title: string;
  panel: Panel[];

  // Optional
  id?: string;
  backgroundImage?: string;
  includeInToc?: boolean; // default true
}
```

### Properties

- **`title`** (Required): Used for the slide heading and TOC entry (unless overridden by `tableOfContents`).
- **`panel`** (Required): One or more panels; see [Panel Types](#panel-types). A text panel paired with one media panel (image/video/map/slideshow) gets a side-by-side layout.
- **`id`** (Optional): Stable, language-independent id used for the slide's URL hash/DOM id. Falls back to a slugified `title` when omitted - since the title is what gets translated, set matching `id`s across a story's different-language configs (see the [French demo](../demo/configs/demo-story-fr.json)) so deep links keep working after a language switch.
- **`backgroundImage`** (Optional): Full-page crossfade background while this slide is active.
- **`includeInToc`** (Optional): Set `false` to hide this slide from the table of contents. Default `true`.

## Panel Types

Every panel has an optional `title` in addition to its type-specific fields below.

### text

```ts
interface TextPanel {
  type: "text";
  content?: string;      // Inline Markdown. Provide this or contentFile (contentFile wins if both are set).
  contentFile?: string;  // Path to an external .md file, fetched at runtime
  cssClasses?: string;   // Optional extra CSS class(es)
}
```

Long-form content can be kept out of the JSON entirely with `contentFile` - useful for slides with a lot of prose (see the [French demo](../demo/configs/demo-story-fr.json)'s "Guiding Principles" slide, which loads [content/guiding-principles-fr.md](../demo/content/guiding-principles-fr.md)). The path is resolved like any other relative path in a config (e.g. an image `src`) - relative to the HTML page, not to the config JSON's own location.

### image

```ts
interface ImagePanel {
  type: "image";
  src: string;          // Required
  altText?: string;
  caption?: string;      // Shown below the image
  fullscreen?: boolean;  // default true
}
```

`fullscreen` (Optional): click (or Enter/Space) opens a full-screen view. Set to `false` to disable. **Not shown in demo.**

### video

```ts
interface VideoPanel {
  type: "video";
  src: string;                                 // Required
  videoType: "local" | "external" | "YouTube";  // Required
  caption?: string;     // Local video captions track source
  transcript?: string;  // Link to a transcript, shown below the video
  width?: string | number;  // Local/external video width
  height?: number;          // iframe height for YouTube
  autoplay?: boolean;       // Local/external video autoplay
}
```

> **Not shown in demo:** `videoType: "local"` / `"external"` (only `"YouTube"` is used), `transcript`, `width`, `autoplay`.

### map

```ts
interface MapPanel {
  type: "map";
  config: string;       // Required, path to a GeoView map config JSON
  scrollguard?: boolean; // Requires Ctrl/Cmd + scroll to zoom
}
```

`scrollguard` (Optional) prevents page scrolling from being hijacked by the map - the user must hold Ctrl/Cmd while scrolling to zoom.

### quote

```ts
interface QuotePanel {
  type: "quote";
  quote: string; // Required
  author?: string;
  role?: string;
  organization?: string;
}
```

### slideshow

Image gallery carousel with dot navigation, back/forward arrows, and a full-screen viewer.

```ts
interface SlideshowPanel {
  type: "slideshow";
  items: SlideshowItem[]; // Required
  loop?: boolean;           // default false
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"; // default "cover"
}

interface SlideshowItem {
  src: string; // Required
  altText?: string;
  text?: string;                     // Optional overlay caption, semi-transparent backdrop
  textPosition?: "left" | "right";   // default "left"
}
```

- **`loop`**: Wrap around at the first/last image instead of disabling the arrow.
- **`objectFit`**: How each image fills the carousel frame. **Only `"contain"` shown in demo.**
- **`textPosition`**: Which side the caption sits on - choose whichever side doesn't cover the important part of the photo.

### interactive-map

```ts
interface InteractiveMapPanel {
  type: "interactive-map";
  config: string;          // Required, path to a GeoView map config JSON
  points: PointOfInterest[]; // Required
  duration?: number;         // ms, zoom animation duration for every point
  scrollguard?: boolean;     // Same as the map panel's
}

interface PointOfInterest {
  title?: string;
  text?: string;   // Description shown on the POI card
  image?: string;  // Photo shown at the top of the card
  altText?: string;
  field?: string;  // Feature attribute name to read and display live from the map service
  target: {
    layerId?: string;        // e.g. "geoviewLayerId/layerId"
    oid?: string | number;   // Feature object ID to zoom to
    value?: string | number; // Static label, shown if field isn't set or unavailable
    scale?: number;          // Target map scale denominator (e.g. 50000 for 1:50,000)
    zoom?: number;           // Explicit target zoom; takes precedence over scale
    returnHome?: boolean;    // Return to the map's initial extent instead of zooming to a feature
  };
}
```

> **Not shown in demo:** `field` (the demo uses `target.value` instead, a static author-provided label), `target.zoom` (the demo only uses `scale`).

### doormat

A responsive grid of link cards, useful for "additional resources" style lists. Each card is a single link with a title bar and optional description.

```ts
interface DoormatPanel {
  type: "doormat";
  items: DoormatItem[]; // Required
}

interface DoormatItem {
  title: string;       // Required, shown in the card's title bar
  href: string;         // Required
  description?: string;
  external?: boolean;   // default true, opens in a new tab with rel="noopener noreferrer"
}
```

> Prefer this over embedding raw HTML/CSS in a `text` panel's `content` for link grids - it's schema-validated, themed (light/dark) automatically, and doesn't depend on external CSS classes.

### dynamic (reserved)

> ⚠️ This panel type is defined in the schema (`content`, `contentWidth`, `reversed`, `children`) but **is not implemented yet** - it's a placeholder for a future composable panel type. Avoid using it in configs for now.
