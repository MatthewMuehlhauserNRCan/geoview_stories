import type { Theme } from '@mui/material/styles';
import { Panel } from '@/types/StoryConfig';
/** Shared sx classes for the story-level components (intro slide, slide layout, story viewer) */
export declare const getSxClasses: (theme: Theme) => {
    introSlide: {
        root: {
            minHeight: string;
            display: string;
            alignItems: string;
            justifyContent: string;
            position: string;
            overflow: string;
            backgroundColor: string;
        };
        backgroundImage: {
            position: string;
            top: number;
            left: number;
            width: string;
            height: string;
            objectFit: string;
            objectPosition: string;
            zIndex: number;
        };
        container: {
            position: string;
            zIndex: number;
            textAlign: string;
        };
        logoWrapper: {
            mb: number;
        };
        logo: {
            maxHeight: number;
            maxWidth: string;
        };
        title: {
            color: string;
            fontWeight: number;
            mb: number;
        };
        subtitle: {
            color: string;
            mb: number;
        };
        enterButton: {
            px: number;
            py: number;
            fontSize: string;
        };
    };
    slide: {
        section: {
            minHeight: string;
            py: number;
            position: string;
            width: string;
        };
        inner: {
            position: string;
            width: string;
            px: {
                xs: number;
                md: number;
            };
        };
        row: (flexDirection: {
            xs: string;
            md: string;
        } | string, hasTextAndImage: boolean) => {
            display: string;
            flexDirection: string | {
                xs: string;
                md: string;
            };
            gap: number;
            alignItems: string;
            justifyContent: string;
            minHeight: string;
        };
    };
    storyViewer: {
        backgroundLayer: (image: string, isActive: boolean) => {
            position: string;
            top: number;
            left: number;
            right: number;
            bottom: number;
            backgroundImage: string;
            backgroundSize: string;
            backgroundPosition: string;
            backgroundRepeat: string;
            backgroundColor: string;
            pointerEvents: string;
            zIndex: number;
        };
        root: {
            display: string;
            flexDirection: string;
            minHeight: string;
        };
        centeredMessage: {
            display: string;
            flex: number;
            alignItems: string;
            justifyContent: string;
        };
        contentRow: {
            display: string;
            flex: number;
        };
        main: {
            flex: number;
        };
    };
};
/** Per-panel sizing/sticky behavior within a Slide, depends on panel type and slide layout */
export declare const getPanelSx: (panel: Panel, hasTextAndImage: boolean, hasMultiplePanels: boolean) => any;
//# sourceMappingURL=story-styles.d.ts.map