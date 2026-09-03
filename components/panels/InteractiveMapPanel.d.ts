import React from 'react';
import { InteractiveMapPanel as InteractiveMapPanelType } from '@/types/StoryConfig';
import '@/types/GeoView';
declare global {
    interface Window {
        _cgpvInitializing?: Set<string>;
    }
}
interface InteractiveMapPanelProps {
    panel: InteractiveMapPanelType;
    panelInstanceId?: string;
}
export declare const InteractiveMapPanel: React.FC<InteractiveMapPanelProps>;
export {};
//# sourceMappingURL=InteractiveMapPanel.d.ts.map