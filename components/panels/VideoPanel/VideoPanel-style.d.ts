import type { Theme } from '@mui/material/styles';
export declare const getSxClasses: (theme: Theme) => {
    wrapper: {
        mx: {
            xs: number;
            md: number;
        };
        width: string;
    };
    paper: {
        overflow: string;
        borderRadius: {
            xs: number;
            md: number;
        };
    };
    title: {
        p: number;
    };
    titleText: {
        fontWeight: number;
    };
    videoBody: {
        position: string;
    };
    youtubeFrame: (height: number | string) => {
        width: string;
        height: string | number;
        border: string;
        borderRadius: number;
    };
    localVideo: (width: string | number) => {
        width: string | number;
        maxWidth: string;
        height: string;
        borderRadius: number;
    };
    transcript: {
        p: number;
        backgroundColor: string;
    };
};
//# sourceMappingURL=VideoPanel-style.d.ts.map