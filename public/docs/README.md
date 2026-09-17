# Configuration Reference

Complete reference for GeoView Story Library config JSON files: story structure, theming, and every panel type.

> Quick Start: See the [README](https://github.com/MatthewMuehlhauserNRCan/geoview_stories#readme) for setup instructions, and the [demo](../demo/) for a full working example.

> Fields marked **Not shown in demo** below aren't exercised by `demo/configs/demo-story.json`, so this page is the only place they're documented.

## Table of Contents

- [Story Config](#story-config)
- [Auto-Generated TOC & Sections](#auto-generated-toc--sections)
- [Theming](#theming)
- [Intro Slide](#intro-slide)
- [Slides](#slides)
- [Panel Types](#panel-types)
  - [text](#text)
  - [image](#image)
  - [video](#video)
  - [map](#map)
  - [manual-poi-map](#manual-poi-map)
  - [auto-poi-map](#auto-poi-map)
  - [quote](#quote)
  - [slideshow](#slideshow)
  - [doormat](#doormat)

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
  defaultTitleStyle?: HeadingStyle;

  // Required
  slides: Slide[];
}

interface TocItem {
  title?: string;        // Required unless `autoToc` is set.
  slideIndex?: number;   // Local entry that scrolls to this slide. Omit for an external link or group label.
  href?: string;          // External entry that navigates to another page. Mutually exclusive with slideIndex.
  sublist?: TocItem[];    // Nested entries, fully recursive - a sublist item can itself have a sublist.
  level?: 2 | 3 | 4;      // Auto-populated from the source slide's level; affects title styling only, not indent.
  autoToc?: boolean;      // Sentinel: replaced in place with the auto-generated section/slide tree. See below.
}
```

An entry with neither `slideIndex` nor `href` (just a `title` and a `sublist`) renders as a plain, non-clickable group label - useful for grouping a whole page's entries under one heading (e.g. a language name), with individual sections further down still able to have their own `sublist` (e.g. a group of project summaries within that language).

### Properties

- **`introSlide`** (Optional): Full-screen intro shown before the first slide. See [Intro Slide](#intro-slide).
- **`slides`** (Required): Array of slides that make up the story. See [Slides](#slides).
- **`tocOrientation`** (Optional): Table of contents layout. Default `"vertical"`.
  - `"vertical"`: the usual side Drawer (persistent on desktop, a hamburger-triggered temporary drawer on mobile), with fully recursive `sublist` nesting.
  - `"horizontal"`: a slim, sticky top bar instead of a side Drawer. Only supports **one level** of dropdown (a top-level entry's `sublist` opens a menu; a grandchild's own `sublist` isn't rendered) - a slim bar has nowhere to put a flyout-within-a-flyout. Labels are truncated to a single line. Below the desktop breakpoint it automatically falls back to the same vertical Drawer as `"vertical"`, so it's still usable on narrow screens.
- **`theme`** (Optional): Built-in theme name, or a custom theme object. See [Theming](#theming). **Custom theme objects and `geoviewTheme` not shown in demo config** (the demo instead uses the `data-theme` HTML attribute).
- **`tableOfContents`** (Optional): The TOC is auto-generated straight from each slide's own `title`/`level`, like a document outline - see [Auto-Generated TOC & Sections](#auto-generated-toc--sections) below. Set `tableOfContents` to override or extend that: it fully replaces the auto tree unless you splice the auto tree back in with an `{ "autoToc": true }` entry - useful for a shared TOC across multiple themed story pages, where the current page's own navigation is auto-generated and sibling pages are plain `href` links. See the [French demo](../demo/index_fr.html) for a working example (each language links to the other via `href`).
- **`tocHeading`** (Optional): TOC panel heading. Default `"Chapters"` - override for other languages (e.g. `"Chapitres"`).
- **`lang`** (Optional): Drives the GeoView map viewer's own UI language (`data-lang` on each map element). Default `"en"`. GeoView map configs are already bilingual internally, so a single `config` JSON works for both languages - no need for separate French map configs.
- **`defaultTitleStyle`** (Optional): A base [`HeadingStyle`](#slides) applied to every slide's title, so a look (border/underline/alignment/etc.) doesn't need repeating on each slide by hand. Each slide's own `titleStyle` is shallow-merged on top - only the fields it actually sets override this default, field by field (not a deep merge of nested `border`/`underline` objects - setting either of those on a slide replaces the whole thing). Set a field to `false` (e.g. `titleStyle: { border: false }`) on a slide to opt back out of a default for just that one. See the demo's `defaultTitleStyle` (a subtle bottom rule under every title) and how "Basic Map"/"Auto POI Photo Gallery Example" opt out of it with `border: false` to keep their own underline/plain look.

## Auto-Generated TOC & Sections

By default, the table of contents is built directly from each slide's own heading - no separate TOC list to keep in sync by hand. Every `Slide` has a `level` (1-4, default `1`):

- A **level-1 slide** (the default - most slides) is always its own top-level TOC entry, and becomes the current "section" for whatever slides follow it.
- A **level 2-4 slide** instead nests as a child of the nearest preceding level-1 slide - use this for a slide that's really a sub-heading grouped under the section right before it (e.g. several map examples grouped under a "Maps" section slide). Levels 2-4 all nest at the same TOC depth as each other and are only differentiated by title/TOC size, not extra indentation.
- A slide with `includeInToc: false` produces no TOC entry at all (and can't become a section for later slides to nest under), same as before.

See the demo's "Maps" section (`demo/configs/demo-story.json`): a level-1 "Maps" slide followed by three level-2 slides ("Basic Map", "Manual POI Map Example", "Auto POI Photo Gallery Example"), which produces the exact same nested TOC group you'd otherwise have had to author by hand.

If you still need a fully or partially hand-authored `tableOfContents` (for cross-page links, a language group, custom labels/ordering), you don't lose the auto-generated tree - splice it back in with a `{ "autoToc": true }` entry at whatever position it belongs:

```json
{
  "tocHeading": "Chapters",
  "tableOfContents": [
    {
      "title": "English",
      "sublist": [
        { "autoToc": true }
      ]
    },
    { "title": "Français", "href": "index_fr.html" }
  ]
}
```

Here, "English" wraps this story's own auto-generated section/slide tree, while "Français" is a plain cross-page link - so you still get one shared, hand-authored top level (grouping/ordering languages or sibling story pages) without re-typing every slide title into `tableOfContents` yourself.

Each entry is either local (`slideIndex`, scrolls within the page), external (`href`, navigates to another page, rendered with an external-link icon and never highlighted as active), or a plain group label (neither field set - just a heading for its own `sublist`). `sublist` nesting is recursive, so a "theme"/language group can contain sections that each group their own items, to whatever depth you need. Local and external entries can be freely mixed at any level, in whatever order matches your site's overall navigation - this is what makes a cross-page link (a language switch, a link to a sibling "theme" page, etc.) sit at the right position relative to the current page's own entries.

> See the [French demo](../demo/index_fr.html) for this pattern working end-to-end: `demo/configs/demo-story.json` and `demo/configs/demo-story-fr.json` each end their `tableOfContents` with a link to the other language, and share the same `Slide.id` per slide so deep links (e.g. `#3-basic-map`) resolve correctly after following the link.

## Theming

Select a built-in theme by name:

```json
{ "theme": "dark" }
```

If `theme` is omitted entirely, the story follows the visitor's OS/browser `prefers-color-scheme` (light or dark) instead of defaulting to light - read once on load, not live-updated if the visitor changes it while the page is open. Setting `theme` to anything (a name or a custom object) always takes priority over that.

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
  panel: Panel[] | Panel[][]; // Panel[] = one row; Panel[][] = several rows stacked vertically

  // Optional
  level?: 1 | 2 | 3 | 4; // default 1
  titleStyle?: HeadingStyle;
  id?: string;
  backgroundImage?: string;
  includeInToc?: boolean; // default true
}

interface HeadingStyle {
  align?: "left" | "center" | "right";
  backgroundColor?: string;
  backgroundImage?: string;
  border?: boolean | HeadingBorderStyle; // true for a simple default border; an object for full control
  underline?: boolean | HeadingUnderlineStyle; // true for a simple default underline; an object for control
  color?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
}

interface HeadingBorderStyle {
  width?: string | number; // default 1 (px)
  style?: "solid" | "dashed" | "dotted" | "double" | "groove" | "ridge" | "inset" | "outset"; // default "solid"
  color?: string; // default the theme's divider color
  sides?: Array<"top" | "right" | "bottom" | "left">; // default all 4; e.g. ["bottom"] for a simple rule
}

interface HeadingUnderlineStyle {
  color?: string; // default currentColor
  thickness?: string | number; // default 2 (px)
  offset?: string | number; // gap between text and the line; default 4 (px)
}
```

A `border` with a partial `sides` list (e.g. just `["bottom"]`) renders as a simple rule - padding is only added on the side(s) actually drawn, so it doesn't look like an oddly one-sided box. A full 4-side border (the default, or `border: true`) keeps the boxed-heading look (padding on all sides, rounded corners). `underline` is a separate, simpler option for a plain text-decoration line instead of a border - handy for breaking up a title-only slide (see [Auto-Generated TOC & Sections](#auto-generated-toc--sections)) without the extra weight of a full box. See the demo's "Maps" section slides for a bottom-border vs. underline vs. plain comparison.

### Properties

- **`title`** (Required): The slide's single heading - also drives the auto-generated TOC entry (unless overridden by `tableOfContents`). See [Auto-Generated TOC & Sections](#auto-generated-toc--sections).
- **`panel`** (Required): `Panel[]` (a flat array - the common case) is a single row: one or more panels laid out side by side on desktop and stacked on mobile; see [Panel Types](#panel-types). A text panel paired with one media panel (image/video/map/slideshow) gets a side-by-side layout. `Panel[][]` (an array of rows) stacks several such rows vertically under this same slide/title - useful for several independent text/image blocks that don't each need their own title. An empty array (`[]`) is valid - useful for a pure "section header" slide whose only purpose is the title itself (see `level` below); a panel-less slide automatically gets much less vertical padding than a normal slide, so it doesn't leave a large empty-looking gap before the next slide. See the demo's "Maps" section slide. **Multi-row `Panel[][]` not shown in demo.**
- **`level`** (Optional): Heading level, `1`-`4`. Default `1` (most slides - each is its own top-level TOC entry, at the size shown throughout the demo). Set `2`-`4` for a slide that's really a sub-heading grouped under the level-1 slide right before it - it renders smaller and nests as a TOC child of that slide instead of getting its own top-level entry. See [Auto-Generated TOC & Sections](#auto-generated-toc--sections) and the demo's "Maps" section (a level-1 slide followed by three level-2 slides).
- **`titleStyle`** (Optional): Visual overrides for this slide's title - `align`, `backgroundColor`, `backgroundImage`, `border` (`true` for a simple default box, or a `{ width, style, color, sides }` object - `sides: ["bottom"]` for a simple rule instead of a full box), `underline` (`true` for a simple default, or a `{ color, thickness, offset }` object), `color`, `fontSize`, `fontWeight`. Unset fields fall back to the normal look for that `level`. See the demo's "Maps" section slides.
- **`id`** (Optional): Stable, language-independent id used for the slide's URL hash/DOM id. Falls back to a slugified `title` when omitted - since the title is what gets translated, set matching `id`s across a story's different-language configs (see the [French demo](../demo/configs/demo-story-fr.json)) so deep links keep working after a language switch.
- **`backgroundImage`** (Optional): Full-page crossfade background while this slide is active.
- **`includeInToc`** (Optional): Set `false` to hide this slide from the table of contents. Default `true`.

### Example: stacking rows under one title

```json
{
  "title": "Project Photos",
  "panel": [
    [{ "type": "text", "content": "First batch of photos from the field survey." }],
    [
      { "type": "image", "src": "images/site-a.jpg", "cssClasses": "grow" },
      { "type": "image", "src": "images/site-b.jpg", "cssClasses": "grow" }
    ],
    [{ "type": "text", "content": "A second, unrelated batch from a later visit." }]
  ]
}
```

This renders as one slide/heading ("Project Photos") with three rows stacked vertically: a text row, a two-image side-by-side row, then another text row - without needing three separate slides (and three separate titles) to keep each block visually distinct.

## Panel Types

Every slide's own `title` (see [Slides](#slides) above) is the section's heading - panels themselves don't have a `title` field, so there's exactly one heading per slide regardless of how many panels it has. Every panel type also accepts an optional `cssClasses` for width/alignment overrides - see [Panel Width & Alignment](#panel-width--alignment-cssclasses) below.

### Panel Width & Alignment (`cssClasses`)

Every panel type accepts an optional `cssClasses` field - one or more space-separated utility class names (from `src/styles/panels.css`) applied to the panel's outer wrapper, which is the actual flex item in its slide row. There are three independent, composable axes:

**Space-sharing** - how a panel shares the row with its siblings, using `flex-grow` instead of hardcoded percentages so it scales to any number of panels:

| Class | Effect |
| --- | --- |
| `grow` | Shares available row space evenly with any sibling that also has `grow`. |
| `grow-2` / `grow-3` | Same, but claims 2x/3x as much space as a plain `grow` sibling. |
| `no-grow` | Sizes to its own content instead of growing to fill space. |

**Width ceiling** - caps how wide a panel can get (layered on top of whichever grow behavior applies), using `min(Xpx, 100%)` so it shrinks to fit narrow viewports instead of overflowing:

| Class | Effect |
| --- | --- |
| `narrow` | Caps width at `min(600px, 100%)`. |
| `wide` | Caps width at `min(1200px, 100%)`. |
| `full-width` | Removes any width cap - spans whatever space it has. |

**Alignment** - pushes a panel within whatever free space is left in the row (only visible if the panel isn't also `grow`, since a growing panel has no free space to push into):

| Class | Effect |
| --- | --- |
| `left-align` | Pushes to the left. |
| `right-align` | Pushes to the right. |
| `center-align` | Centers. |

Classes combine freely, e.g. `"narrow right-align"` narrows a panel and pushes it to the right. For two or more panels sharing a row, put `grow` (or `grow-2`/`grow-3`) on each one that should participate in the split - e.g. `grow` on both a text and image panel gives an even 50/50 split instead of the default 33/66; adding `narrow` to both leaves a gap in the middle (and around the edges) where the slide's own `backgroundImage` can show through.

See the demo's "Panel Layout Example" slide ([English](../demo/configs/demo-story.json) / [French](../demo/configs/demo-story-fr.json)) for a working example.

### text

```ts
interface TextPanel {
  type: "text";
  content?: string;      // Inline Markdown. Provide this or contentFile (contentFile wins if both are set).
  contentFile?: string;  // Path to an external .md file, fetched at runtime
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
  src: string;                                          // Required
  videoType: "local" | "external" | "embed"; // Required
  caption?: string;     // Local video captions track source
  transcript?: string;  // Link to a transcript, shown below the video
  width?: string | number;  // Local/external video width
  height?: number;          // Optional cap on the embed iframe's height; it's 16:9 responsive by default
  autoplay?: boolean;       // Local/external video autoplay
}
```

- **`videoType`**: `"local"`/`"external"` render a native `<video>` element (a real video file - `src` extension is used to set the correct MIME type, e.g. `.mp4`/`.webm`/`.ogg`/`.mov`). `"embed"` renders an `<iframe>` - use this for any platform with an embed URL (YouTube, Vimeo, Dailymotion, etc.); there's no platform-specific logic, `src` is used as-is, so point it at whatever ready-to-embed URL that platform gives you.
- **`height`**: the embed iframe scales at a 16:9 aspect ratio by its actual rendered width (e.g. next to a text panel) rather than a fixed pixel height, which would otherwise stretch or squish it depending on how wide its column ends up. Set `height` only if you need to cap how tall it's allowed to grow on a very wide column.

> **Not shown in demo:** `videoType: "local"` / `"external"` (only `"embed"` is used), `transcript`, `width`, `autoplay`.

### map

```ts
interface MapPanel {
  type: "map";
  config: string;       // Required, path to a GeoView map config JSON
  scrollguard?: boolean; // Requires Ctrl/Cmd + scroll to zoom
}
```

`scrollguard` (Optional) prevents page scrolling from being hijacked by the map - the user must hold Ctrl/Cmd while scrolling to zoom.

### manual-poi-map

A map paired with a scrollable, hand-authored list of points of interest - each one zooms the map to a specific feature as it scrolls into view.

```ts
interface ManualPoiMapPanel {
  type: "manual-poi-map";
  config: string;          // Required, path to a GeoView map config JSON
  points: PointOfInterest[]; // Required
  linkLabel?: string;        // Default link button label for points that don't set their own; default "Learn more"
  duration?: number;         // ms, zoom animation duration for every point
  scrollguard?: boolean;     // Same as the map panel's
  mapPosition?: "left" | "right"; // Which side the sticky map sits on; default "left"
}

interface PointOfInterest {
  title?: string;
  text?: string;   // Description shown on the POI card
  image?: string | string[]; // One photo, or several for a gallery with a lightbox
  altText?: string;
  linkUrl?: string;   // Rendered as a link button on the card
  linkLabel?: string; // Overrides the panel's linkLabel for just this point
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

- **`image`**: a single URL, or an array of URLs for a photo gallery - same lightbox behavior as `auto-poi-map`'s `imageField` (first photo is the clickable thumbnail; a gallery badge and prev/next controls appear when there's more than one).

> **Not shown in demo:** `field` (the demo uses `target.value` instead, a static author-provided label), `target.zoom` (the demo only uses `scale`), `linkUrl`/`linkLabel`, multi-image `image` arrays.

### auto-poi-map

Like `manual-poi-map`, but instead of hand-authoring each point of interest, one POI card is generated automatically for **every feature** in a layer - useful when a layer's attribute table already has the content you'd otherwise be copying into `points[]` by hand.

```ts
interface AutoPoiMapPanel {
  type: "auto-poi-map";
  config: string;    // Required, path to a GeoView map config JSON
  layerId: string;   // Required, e.g. "geoviewLayerId/layerId" - every matching feature in this layer becomes one POI
  titleField?: string;  // Feature attribute -> card title; missing/empty -> no title rendered
  textField?: string;   // Feature attribute -> card body text
  linkField?: string;   // Feature attribute holding a URL -> rendered as a link on the card
  linkLabel?: string;   // Static label for the link (the field only holds the URL itself); default "Learn more"
  imageField?: string;  // Feature attribute holding an image URL -> shown atop the card
  sortField?: string;   // Feature attribute to sort POIs by; omit to keep the order features are returned in
  sortDirection?: "asc" | "desc"; // default "asc"
  filter?: PoiFilter;   // Optional subset of the layer's features that become POIs
  scale?: number;    // Target map scale denominator applied to every auto-generated POI
  duration?: number; // ms, zoom animation duration for every point
  scrollguard?: boolean;
  mapPosition?: "left" | "right"; // Which side the sticky map sits on; default "left"
}

type PoiFilterOperator = "equals" | "notEquals" | "contains" | "gt" | "gte" | "lt" | "lte" | "in" | "isNull" | "isNotNull";

interface PoiFilterCondition {
  field: string;
  operator: PoiFilterOperator;
  value?: string | number | boolean | Array<string | number>; // not needed for isNull/isNotNull; an array only for "in"
}

interface PoiFilterGroup {
  all?: PoiFilter[]; // AND
  any?: PoiFilter[]; // OR
  not?: PoiFilter;
}

type PoiFilter = PoiFilterCondition | PoiFilterGroup;
```

- A missing/empty field for a given feature just means that piece doesn't render for that card (e.g. no `titleField` value -> no title), not an error.
- There's no built-in limit on how many features become POIs - a layer with hundreds of features means hundreds of scroll-triggered cards, so this works best with a small, curated layer. It's on the story author to pick a layer sized appropriately for a scrollytelling list.
- All fields (including the legend swatch icon) come from the **one** configured layer, unlike `manual-poi-map` where each point can reference a different layer.
- **`imageField`** can hold more than one photo: a value containing `;` (e.g. `"a.jpg;b.jpg;c.jpg"`) is split into a list. The card always shows the first photo as a clickable thumbnail that opens a full-size lightbox; if there's more than one photo, a small gallery badge appears on it and the lightbox gets prev/next controls to step through all of them.
- **`filter`** (Optional): lets the map show every feature in the layer while only a subset become scroll-triggered POI cards - independent of any filter already applied to the layer itself. Evaluated client-side against each feature's attributes; `all`/`any`/`not` nest freely for arbitrary AND/OR/NOT grouping, e.g.:
  ```json
  {
    "filter": {
      "all": [
        { "field": "Status", "operator": "equals", "value": "Active" },
        { "field": "Year", "operator": "gte", "value": 2020 }
      ]
    }
  }
  ```
  This is a structured JSON condition tree rather than a SQL-like string, deliberately - no expression parser or `eval` involved, just data-driven comparisons. **Not shown in demo.**
- **`mapPosition`**: swaps which side the sticky map sits on (`"left"` puts the POI list on the right, the default; `"right"` puts the map on the right and the POI list on the left). Also available on `manual-poi-map`.

> The demo's `auto-poi-map` example runs against a small GeoJSON polygon layer that exercises `titleField`, `textField`, `linkField`, a multi-photo `imageField` (one feature intentionally omits it, and two share the same `titleField` value, to show both of those cases rendering cleanly), and `mapPosition: "right"`. `filter` isn't exercised.

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
