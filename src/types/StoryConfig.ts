/**
 * Story configuration types based on Stories schema
 */

export interface StoryConfig {
  introSlide?: IntroSlide;
  slides: Slide[];
  lang?: 'en' | 'fr'; // Drives the GeoView map viewer's own UI language (data-lang); default 'en'
  // Explicit override of the auto-derived TOC (one entry per non-excluded slide). Lets a
  // page reorder/relabel entries, group slides under one heading via `sublist`, and mix in
  // links to other theme pages (href) at whatever position matches the site's overall order.
  tableOfContents?: TocItem[];
  tocOrientation?: 'vertical' | 'horizontal';
  tocHeading?: string; // TOC panel heading; default "Chapters" (e.g. "Chapitres" for a French story)
  // Name of a built-in theme (e.g. 'light', 'dark'), or a custom theme definition. Can be
  // overridden at the HTML level via a `data-theme` attribute on the story's container element,
  // so multiple entry points can reuse one config file with different themes.
  theme?: string | StoryThemeConfig;
  // Base title style applied to every slide, so a look (border/underline/alignment/etc.) doesn't
  // need repeating on each slide by hand. A slide's own `titleStyle` is shallow-merged on top -
  // each field it sets wins over this default; set a field to `false`/omit it to fall back here.
  defaultTitleStyle?: HeadingStyle;
}

export interface StoryThemeConfig {
  name?: string; // Base built-in theme to start from; other fields here override it
  mode?: 'light' | 'dark';
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string; // Page background
  paperColor?: string; // Card/panel background
  textColor?: string; // Primary text color
  fontFamily?: string;
  // Which GeoView map theme to use ('dark' | 'light' | 'geo.ca' | 'canada.ca').
  // GeoView only understands its own 4 values, so this can't always be inferred
  // from a custom app theme's mode - set explicitly if the auto-guess is wrong.
  geoviewTheme?: 'dark' | 'light' | 'geo.ca' | 'canada.ca';
}

export interface IntroSlide {
  logo?: {
    src: string;
    altText: string;
  };
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  scrimOpacity?: number; // 0-1 darkening over backgroundImage for text contrast (WCAG); defaults to 0.4
}

// Styling overrides for a slide or intro title - unset fields fall back to the normal look for
// that heading level (font size/weight come from the level; these mostly cover layout/decoration).
export interface HeadingStyle {
  align?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  backgroundImage?: string;
  // `true` for a simple default (1px solid, theme divider color, all 4 sides); an object for full
  // control, including a bottom (or other single-side) rule instead of a full box via `sides`.
  border?: boolean | HeadingBorderStyle;
  // `true` for a simple default underline; an object for control over color/thickness/offset.
  underline?: boolean | HeadingUnderlineStyle;
  color?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
}

export interface HeadingBorderStyle {
  width?: string | number; // default 1 (px)
  style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset'; // default 'solid'
  color?: string; // default theme divider color
  // Which side(s) get the border; default all 4. E.g. `['bottom']` for a simple rule under the
  // title instead of a full box - padding is also only added on the included sides in that case.
  sides?: Array<'top' | 'right' | 'bottom' | 'left'>;
}

export interface HeadingUnderlineStyle {
  color?: string; // default currentColor (matches the title's own text color)
  thickness?: string | number; // default 2 (px)
  offset?: string | number; // gap between the text baseline and the line; default 4 (px)
}

export interface Slide {
  title: string;
  // Heading level for this slide's title - drives both its visual size (h1-h4) and how it's
  // grouped in the auto-generated table of contents: a level-1 slide (the default) is always its
  // own top-level TOC entry and becomes the current "section" for any slides that follow; a
  // level 2-4 slide instead nests as a flat child of the nearest preceding level-1 slide (rare -
  // use it for a slide that's really a sub-heading under the section right before it, e.g. one of
  // several map examples grouped under a "Maps" section slide). Levels 2-4 all nest at the same
  // TOC depth as each other, differentiated only by title size/styling, not extra indentation.
  level?: 1 | 2 | 3 | 4;
  // Visual overrides for this slide's title; unset fields fall back to the level's default look.
  titleStyle?: HeadingStyle;
  // Stable, language-independent id used for the slide's URL hash/DOM id. Falls back to a
  // slugified `title` when omitted, so give matching stories in different languages the same
  // `id` per slide to keep deep links working when the title text itself is translated.
  id?: string;
  backgroundImage?: string;
  // Darkening overlay on this slide's own backgroundImage (0-1) - each background photo can need
  // a different amount, especially since the same image renders under both light and dark themes.
  // Omit to fall back to a mode-based default (darker in dark mode) so plain photos aren't required
  // to set this at all.
  backgroundScrimOpacity?: number;
  // A flat array is one row (panels laid out side by side on desktop, stacked on mobile - the
  // usual case). Use an array of arrays to stack several such rows vertically under this same
  // slide/title instead of starting a new slide just to get a second title-less row of panels.
  // e.g. one row:  "panel": [ {...}, {...} ]
  //     two rows:  "panel": [ [ {...}, {...} ], [ {...} ] ]
  panel: Panel[] | Panel[][];
  // Omitting an entry from the TOC also means it can't become the "section" that later level 2-4
  // slides nest under (see Slide.level) - they fall back to their own top-level TOC entries instead.
  includeInToc?: boolean;
}

export interface BasePanel {
  type: 'text' | 'image' | 'map' | 'video' | 'slideshow' | 'manual-poi-map' | 'auto-poi-map' | 'quote' | 'doormat';
  // Optional utility class(es) from src/styles/panels.css (e.g. "narrow right-align") for
  // width/alignment overrides - works on every panel type, not just text.
  cssClasses?: string;
}

export interface TextPanel extends BasePanel {
  type: 'text';
  content?: string; // Inline markdown. Provide this or contentFile (contentFile wins if both are set).
  contentFile?: string; // Path to an external .md file, fetched at runtime - keeps long-form content out of the JSON.
}

export interface DoormatItem {
  title: string;
  description?: string;
  href: string;
  external?: boolean; // Opens in a new tab; defaults to true
}

export interface DoormatPanel extends BasePanel {
  type: 'doormat';
  items: DoormatItem[];
}


export interface ImagePanel extends BasePanel {
  type: 'image';
  src: string;
  altText?: string;
  caption?: string;
  fullscreen?: boolean;
}

export interface MapPanel extends BasePanel {
  type: 'map';
  config: string; // Path to a GeoView map config JSON file (fetched at runtime, not inline JSON)
  scrollguard?: boolean;
}

export interface ManualPoiMapPanel extends BasePanel {
  type: 'manual-poi-map';
  config: string; // Path to a GeoView map config JSON file (fetched at runtime, not inline JSON)
  points: PointOfInterest[];
  linkLabel?: string; // Default link button label for points that don't set their own; defaults to "Learn more"
  duration?: number;
  scrollguard?: boolean;
  // Which side the sticky map sits on, with the POI list on the other side; default 'left'.
  mapPosition?: 'left' | 'right';
}

export interface AutoPoiMapPanel extends BasePanel {
  type: 'auto-poi-map';
  config: string; // Path to a GeoView map config JSON file (fetched at runtime, not inline JSON)
  layerId: string; // Layer whose features each become one POI
  titleField?: string; // Feature attribute -> card title; missing/empty -> no title rendered
  textField?: string; // Feature attribute -> card body text
  linkField?: string; // Feature attribute holding a URL -> rendered as a link on the card
  linkLabel?: string; // Static label for the link (the field only holds the URL itself); defaults to "Learn more"
  imageField?: string; // Feature attribute holding an image URL -> shown atop the card like PointOfInterest.image
  sortField?: string; // Feature attribute to sort POIs by; omit to keep the order features are returned in
  sortDirection?: 'asc' | 'desc'; // default 'asc'
  // Optional subset of the layer's features to turn into POIs - independent of any filter already
  // applied to the layer itself (e.g. the map can show every feature while only some become POIs).
  filter?: PoiFilter;
  scale?: number; // Target map scale denominator applied to every auto-generated POI
  duration?: number;
  scrollguard?: boolean;
  // Which side the sticky map sits on, with the POI list on the other side; default 'left'.
  mapPosition?: 'left' | 'right';
}

export type PoiFilterOperator = 'equals' | 'notEquals' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'isNull' | 'isNotNull';

export interface PoiFilterCondition {
  field: string;
  operator: PoiFilterOperator;
  // Not needed for isNull/isNotNull; an array only for "in"
  value?: string | number | boolean | Array<string | number>;
}

export interface PoiFilterGroup {
  all?: PoiFilter[]; // AND
  any?: PoiFilter[]; // OR
  not?: PoiFilter;
}

// e.g. only active features in one of two provinces:
//   {
//     "all": [
//       { "field": "STATUS", "operator": "equals", "value": "active" },
//       { "any": [
//         { "field": "PROVINCE", "operator": "equals", "value": "ON" },
//         { "field": "PROVINCE", "operator": "equals", "value": "QC" }
//       ] }
//     ]
//   }
export type PoiFilter = PoiFilterCondition | PoiFilterGroup;

export interface PointOfInterest {
  title?: string;
  text?: string;
  image?: string | string[]; // One photo, or several for a gallery with a lightbox (like auto-poi-map's imageField)
  altText?: string;
  linkUrl?: string; // Rendered as a link button on the card, like auto-poi-map's linkField
  linkLabel?: string; // Overrides the panel's linkLabel for just this point
  field?: string; // Field name to display from feature attributes
  target: {
    layerId?: string;
    oid?: string | number;
    value?: number | string;
    scale?: number; // Target map scale denominator (e.g. 50000 for 1:50,000)
    zoom?: number; // Target zoom level; takes precedence over scale if both are set
    returnHome?: boolean;
  };
}

export interface VideoPanel extends BasePanel {
  type: 'video';
  src: string;
  // "embed" is a generic iframe embed (YouTube, Vimeo, Dailymotion, etc.) - just point it at
  // whatever ready-to-embed URL that platform gives you.
  videoType: 'local' | 'external' | 'embed';
  caption?: string;
  transcript?: string;
  width?: string | number;
  // Embed iframe is 16:9 responsive by default; this only caps how tall it can grow.
  height?: number;
  autoplay?: boolean;
}

export interface SlideshowItem {
  src: string;
  altText?: string;
  text?: string; // Optional overlay text shown beside the image
  textPosition?: 'left' | 'right'; // Which side the text sits on; defaults to 'left'
}

export interface SlideshowPanel extends BasePanel {
  type: 'slideshow';
  items: SlideshowItem[];
  loop?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'; // How each image fits its frame; defaults to 'cover'
}

export interface QuotePanelConfig extends BasePanel {
  type: 'quote';
  quote: string;
  author?: string;
  role?: string;
  organization?: string;
}

export type Panel =
  | TextPanel
  | ImagePanel
  | MapPanel
  | ManualPoiMapPanel
  | AutoPoiMapPanel
  | VideoPanel
  | SlideshowPanel
  | QuotePanelConfig
  | DoormatPanel;

export interface TocItem {
  // Required unless `autoToc` is set.
  title?: string;
  slideIndex?: number; // Local entry that scrolls to this slide. Omit for an external link or group label.
  href?: string; // External entry that navigates to another page instead of scrolling. Mutually exclusive with slideIndex.
  // Nested entries, fully recursive - a sublist item can itself have a slideIndex, an href, and/or
  // its own sublist (e.g. a "theme"/language group containing sections that each group their own items).
  sublist?: TocItem[];
  // Auto-populated on generated entries from the source slide's `level` (2-4); only affects TOC
  // title styling, not indentation - all of a section's children render at the same depth.
  level?: 2 | 3 | 4;
  // Sentinel: wherever this appears in a manually-authored `tableOfContents` array (at any depth),
  // it's replaced in place with the story's own auto-generated section/slide tree (built from each
  // slide's `title`/`level`). Lets a manual list mix hand-authored entries (cross-page links,
  // language groups) with this story's own real heading-based navigation.
  autoToc?: boolean;
}
