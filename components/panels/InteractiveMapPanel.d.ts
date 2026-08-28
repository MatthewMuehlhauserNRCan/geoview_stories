import React from 'react';
import { InteractiveMapPanel as InteractiveMapPanelType } from '@/types/StoryConfig';
import '@/types/GeoView';
declare global {
    interface Window {
        _cgpvInitCalled?: boolean;
    }
}
interface InteractiveMapPanelProps {
    panel: InteractiveMapPanelType;
}
export declare const InteractiveMapPanel: React.FC<InteractiveMapPanelProps>;
export {};
//# sourceMappingURL=InteractiveMapPanel.d.ts.map