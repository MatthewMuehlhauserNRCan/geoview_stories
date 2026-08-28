/**
 * GeoView (cgpv) global type definitions
 * Shared across all components that use GeoView
 */
declare global {
    interface Window {
        cgpv: {
            init: (callback?: () => void) => void;
            onMapInit: (callback: (mapViewer: any) => void) => () => void;
            onMapReady: (callback: (mapViewer: any) => void) => () => void;
            api: {
                getMapViewerIds: () => string[];
                deleteMapViewer?: (mapId: string, deleteContainer: boolean) => void;
                getMapViewer: (mapId: string) => GeoviewMapViewer | undefined;
            };
        };
    }
    interface GeoviewMapViewer {
        controllers: {
            mapController: {
                zoomToInitialExtent: () => void;
                zoomToExtent: (extent: Extent, animate?: boolean, options?: FitOptions) => void;
            };
            layerController: {
                getGeoviewLayerPaths: () => string[];
                getGeoviewLayer: (layerPath: string) => GeoviewLayer | undefined;
            };
        };
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