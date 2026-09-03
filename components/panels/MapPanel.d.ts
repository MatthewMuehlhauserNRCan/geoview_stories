import React from 'react';
import { MapPanel as MapPanelType } from '@/types/StoryConfig';
import '@/types/GeoView';
declare global {
    interface Window {
        _cgpvInitializing?: Set<string>;
    }
}
interface MapPanelProps {
    panel: MapPanelType;
    panelInstanceId?: string;
}
export declare const MapPanel: React.FC<MapPanelProps>;
export {};
//# sourceMappingURL=MapPanel.d.ts.map