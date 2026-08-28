import React from 'react';
import { TocItem } from '@/types/StoryConfig';
interface TableOfContentsProps {
    items: TocItem[];
    activeIndex: number;
    onItemClick: (slideId: string) => void;
    orientation?: 'vertical' | 'horizontal';
    collapsed?: boolean;
    onToggle?: () => void;
}
export declare const TableOfContents: React.FC<TableOfContentsProps>;
export {};
//# sourceMappingURL=TableOfContents.d.ts.map