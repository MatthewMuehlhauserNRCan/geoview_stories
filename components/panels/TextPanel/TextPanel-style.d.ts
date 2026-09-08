import type { Theme } from '@mui/material/styles';
export declare const getSxClasses: (theme: Theme) => {
    paper: {
        p: number;
        backgroundColor: string;
        borderRadius: number;
    };
    title: {
        fontWeight: number;
    };
    content: {
        '& p': {
            mb: number;
            lineHeight: number;
        };
        '& h1, & h2, & h3': {
            mt: number;
            mb: number;
            fontWeight: number;
        };
        '& ul, & ol': {
            pl: number;
            mb: number;
        };
        '& a': {
            color: string;
            textDecoration: string;
            '&:hover': {
                textDecoration: string;
            };
        };
        '& img': {
            maxWidth: string;
            height: string;
            borderRadius: number;
        };
    };
};
//# sourceMappingURL=TextPanel-style.d.ts.map