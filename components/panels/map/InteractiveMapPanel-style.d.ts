import type { Theme } from '@mui/material/styles';
export declare const getSxClasses: (theme: Theme) => {
    root: {
        display: string;
        flexDirection: {
            xs: string;
            md: string;
        };
        gap: {
            xs: number;
            md: number;
        };
        minHeight: string;
        mx: {
            xs: number;
            md: number;
        };
    };
    mapWrapper: {
        flex: {
            xs: string;
            md: string;
        };
        width: {
            xs: string;
            md: string;
        };
        minWidth: number;
        position: string;
        top: {
            xs: number;
            md: number;
        };
        alignSelf: string;
        height: {
            xs: string;
            md: string;
        };
        maxHeight: {
            md: string;
        };
        zIndex: number;
    };
    mapPaper: {
        height: string;
        position: string;
    };
    mapBody: (hasTitle: boolean) => {
        position: string;
        height: string;
    };
    poiSection: {
        flex: string;
        minWidth: number;
        mt: {
            xs: number;
            md: number;
        };
        px: {
            xs: number;
            md: number;
        };
    };
    poiSectionHeading: {
        fontWeight: number;
        mb: number;
        px: number;
    };
    poiStack: {
        pt: {
            xs: number;
            md: number;
        };
        pb: number;
    };
    poiCard: (isActive: boolean) => {
        overflow: string;
        border: string;
        borderColor: string;
        borderRadius: number;
        backgroundColor: string;
        transition: string;
        transform: string;
        minHeight: {
            xs: string;
            md: string;
        };
    };
    poiImageWrapper: {
        position: string;
        width: string;
        paddingTop: string;
        overflow: string;
        backgroundColor: string;
    };
    poiImage: {
        position: string;
        top: number;
        left: number;
        width: string;
        height: string;
        objectFit: string;
    };
    poiPinBadge: {
        position: string;
        top: number;
        left: number;
        width: number;
        height: number;
        backgroundColor: string;
        border: string;
        borderColor: string;
        borderRadius: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        boxShadow: number;
    };
    poiContent: {
        p: number;
    };
    poiTitle: {
        fontWeight: number;
        mb: number;
        color: string;
    };
    poiFieldValue: {
        fontWeight: number;
        mb: number;
        color: string;
    };
    poiText: {
        mb: number;
        lineHeight: number;
    };
    poiChips: {
        flexWrap: string;
    };
};
//# sourceMappingURL=InteractiveMapPanel-style.d.ts.map