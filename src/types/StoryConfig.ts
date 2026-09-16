/**
 * Story configuration types based on Stories schema
 */

export interface StoryConfig {
  introSlide?: IntroSlide;
  slides: Slide[];
  tocOrientation?: 'vertical' | 'horizontal';
  theme?: string | StoryThemeConfig; // Name of a built-in theme (e.g. 'light', 'dark'), or a custom theme definition
  // Explicit override of the auto-derived TOC (one entry per non-excluded slide). Lets a
  // page reorder/relabel entries, group slides under one heading via `sublist`, and mix in
  // links to other theme pages (href) at whatever position matches the site's overall order.
  tableOfContents?: TocItem[];
  tocHeading?: string; // TOC panel heading; default "Chapters" (e.g. "Chapitres" for a French story)
  lang?: 'en' | 'fr'; // Drives the GeoView map viewer's own UI language (data-lang); default 'en'
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

export interface Slide {
  title: string;
  // Stable, language-independent id used for the slide's URL hash/DOM id. Falls back to a
  // slugified `title` when omitted, so give matching stories in different languages the same
  // `id` per slide to keep deep links working when the title text itself is translated.
  id?: string;
  backgroundImage?: string;
  panel: Panel[];
  includeInToc?: boolean;
}

export interface BasePanel {
  title?: string;
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
  config: string; // Path to map config or inline config
  scrollguard?: boolean;
}

export interface ManualPoiMapPanel extends BasePanel {
  type: 'manual-poi-map';
  config: string;
  points: PointOfInterest[];
  linkLabel?: string; // Default link button label for points that don't set their own; defaults to "Learn more"
  duration?: number;
  scrollguard?: boolean;
  // Which side the sticky map sits on, with the POI list on the other side; default 'left'.
  mapPosition?: 'left' | 'right';
}

export interface AutoPoiMapPanel extends BasePanel {
  type: 'auto-poi-map';
  config: string;
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
  title: string;
  slideIndex?: number; // Local entry that scrolls to this slide. Omit for an external link or group label.
  href?: string; // External entry that navigates to another page instead of scrolling. Mutually exclusive with slideIndex.
  // Nested entries, fully recursive - a sublist item can itself have a slideIndex, an href, and/or
  // its own sublist (e.g. a "theme"/language group containing sections that each group their own items).
  sublist?: TocItem[];
}
