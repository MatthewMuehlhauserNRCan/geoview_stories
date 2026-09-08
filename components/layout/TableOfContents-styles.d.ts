import type { Theme } from '@mui/material/styles';
export declare const getSxClasses: (theme: Theme) => {
    menuButton: {
        position: string;
        top: number;
        left: number;
        zIndex: number;
        backgroundColor: string;
        boxShadow: number;
        '&:hover': {
            backgroundColor: string;
        };
    };
    drawer: (drawerWidth: number) => {
        width: number;
        flexShrink: number;
        transition: string;
        '& .MuiDrawer-paper': {
            width: number;
            boxSizing: string;
            top: number;
            height: string;
            borderRight: string;
            borderColor: string;
            transition: string;
            overflowX: string;
        };
    };
    drawerBody: {
        overflow: string;
        p: number;
        pt: number;
    };
    collapseRow: {
        display: string;
        justifyContent: string;
        mb: number;
    };
    heading: {
        mb: number;
        fontWeight: number;
        color: string;
    };
    listItem: {
        borderRadius: number;
        mb: number;
        '&.Mui-selected': {
            backgroundColor: string;
            color: string;
            '&:hover': {
                backgroundColor: string;
            };
        };
    };
};
//# sourceMappingURL=TableOfContents-styles.d.ts.map