import type { Theme } from '@mui/material/styles';
/** Shared classes so MapPanel and InteractiveMapPanel look consistent with each other */
export declare const getSxClasses: (theme: Theme) => {
    paper: {
        overflow: string;
        borderRadius: {
            xs: number;
            md: number;
        };
        border: string;
        borderColor: string;
    };
    container: {
        width: string;
        backgroundColor: string;
    };
    titleBar: {
        p: number;
        borderBottom: string;
        borderColor: string;
    };
    overlay: {
        position: string;
        top: number;
        left: number;
        right: number;
        bottom: number;
        display: string;
        alignItems: string;
        justifyContent: string;
        pointerEvents: string;
    };
    loadingOverlay: {
        backgroundColor: string;
        zIndex: number;
    };
    scrollGuardOverlay: {
        backgroundColor: string;
        zIndex: number;
        transition: string;
    };
    scrollGuardMessage: {
        backgroundColor: string;
        px: number;
        py: number;
        borderRadius: number;
        boxShadow: number;
    };
};
//# sourceMappingURL=map-shared-style.d.ts.map