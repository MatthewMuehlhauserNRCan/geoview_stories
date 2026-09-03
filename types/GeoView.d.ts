/**
 * GeoView (cgpv) global type definitions
 * Shared across all components that use GeoView
 */
declare global {
    interface Window {
        cgpv: {
            init: (callback?: () => void) => Promise<void>;
            onMapInit: (callback: (mapViewer: any) => void) => () => void;
            onMapReady: (callback: (mapViewer: any) => void) => () => void;
            onceMapViewerSet: (filter?: (event: any) => boolean) => Promise<GeoviewMapViewer>;
            api: {
                getMapViewerIds: () => string[];
                hasMapViewer: (mapId: string) => boolean;
                deleteMapViewer?: (mapId: string, deleteContainer: boolean) => Promise<void>;
                getMapViewer: (mapId: string) => GeoviewMapViewer | undefined;
                waitForMapViewer: (mapId: string) => Promise<GeoviewMapViewer>;
            };
        };
    }
    interface GeoviewMapViewer {
        mapId: string;
        controllers: {
            mapController: {
                zoomToInitialExtent: () => void;
                zoomToExtent: (extent: Extent, animate?: boolean, options?: FitOptions) => void;
            };
            layerController: {
                getGeoviewLayerPaths: () => string[];
                getGeoviewLayer: (layerPath: string) => GeoviewLayer | undefined;
            };
            uiController: {
                setCrosshairActive: (active: boolean) => void;
            };
        };
        layer: {
            waitForLayersLoaded: () => Promise<number>;
        };
        delete: () => Promise<void>;
        waitForMapReady: () => Promise<void>;
        map?: {
            getSize: () => [number, number] | undefined;
        };
        createMapConfigFromMapState: (maintainGeocoreLayerNames?: boolean) => any;
    }
    interface GeoviewLayer {
        getOLSource: () => any;
    }
    type Extent = [number, number, number, number];
    type Coordinate = [number, number];
    type FitOptions = {
        padding: [number, number, number, number];
        maxZoom: number;
        duration: number;
    };
}
export {};
//# sourceMappingURL=GeoView.d.ts.map