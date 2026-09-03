/**
 * Story configuration types based on Stories schema
 */
export interface StoryConfig {
    title: string;
    introSlide?: IntroSlide;
    slides: Slide[];
    tocOrientation?: 'vertical' | 'horizontal';
    contextLink?: string;
    contextLabel?: string;
    lang?: string;
}
export interface IntroSlide {
    logo?: {
        src: string;
        altText: string;
    };
    title: string;
    subtitle?: string;
    backgroundImage?: string;
}
export interface Slide {
    title: string;
    backgroundImage?: string;
    backgroundAltText?: string;
    panel: Panel[];
    includeInToc?: boolean;
}
export interface BasePanel {
    title?: string;
    type: 'text' | 'image' | 'map' | 'video' | 'slideshow' | 'dynamic' | 'interactive-map' | 'quote';
}
export interface TextPanel extends BasePanel {
    type: 'text';
    content: string;
    cssClasses?: string;
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
    config: string;
    scrollguard?: boolean;
}
export interface InteractiveMapPanel extends BasePanel {
    type: 'interactive-map';
    config: string;
    points: PointOfInterest[];
    duration?: number;
    scrollguard?: boolean;
}
export interface PointOfInterest {
    title?: string;
    text?: string;
    image?: string;
    altText?: string;
    field?: string;
    target: {
        layerId?: string;
        oid?: string | number;
        value?: number | string;
        scale?: number;
        returnHome?: boolean;
    };
    hideLayers?: string[];
}
export interface VideoPanel extends BasePanel {
    type: 'video';
    src: string;
    videoType: 'local' | 'external' | 'YouTube';
    caption?: string;
    transcript?: string;
    width?: string | number;
    height?: number;
    autoplay?: boolean;
}
export interface SlideshowPanel extends BasePanel {
    type: 'slideshow';
    items: Array<ImagePanel | MapPanel>;
    loop?: boolean;
    caption?: string;
}
export interface DynamicPanel extends BasePanel {
    type: 'dynamic';
    content: string;
    contentWidth?: string;
    reversed?: boolean;
    children: Array<{
        id: string;
        panel: Panel;
    }>;
}
export interface QuotePanelConfig extends BasePanel {
    type: 'quote';
    quote: string;
    author?: string;
    role?: string;
    organization?: string;
}
export type Panel = TextPanel | ImagePanel | MapPanel | InteractiveMapPanel | VideoPanel | SlideshowPanel | DynamicPanel | QuotePanelConfig;
export interface TocItem {
    title: string;
    slideIndex: number;
    children?: TocItem[];
}
//# sourceMappingURL=StoryConfig.d.ts.map