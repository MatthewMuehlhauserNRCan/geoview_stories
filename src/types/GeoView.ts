/**
 * GeoView (cgpv) global type definitions
 * Shared across all components that use GeoView
 */

declare global {
  interface Window {
    cgpv: {
      init: (callback?: () => void) => Promise<void>;
      // Note: these do not reliably return an unsubscribe function at runtime; guard with `?.()` when calling
      onMapInit: (callback: (mapViewer: any) => void) => (() => void) | void;
      onMapReady: (callback: (mapViewer: any) => void) => (() => void) | void;
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
    getZoomFromScale: (scale: number) => number | undefined;
    getMapScaleFromZoom: (zoom: number) => number | undefined;
    // GeoView has no data-theme div attribute, only a config field (default
    // 'geo.ca'); this lets us sync the map to our own story-level theme at runtime.
    setTheme: (theme: 'dark' | 'light' | 'geo.ca' | 'canada.ca') => void;
    // OpenLayers View; only what we need to cancel an in-progress fit/animate
    // before starting a new one, so back-to-back zoom requests don't fight each other.
    getView: () => { cancelAnimations: () => void };
    controllers: {
        mapController: {
            zoomToInitialExtent: () => Promise<void>;
            zoomToExtent: (extent: Extent, animate?: boolean, options?: FitOptions) => Promise<void>;
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
    // Shape varies by layer type: a single canvas for raster/WMS/WMTS, or an
    // object keyed by geometry type (Point/LineString/Polygon) with canvases
    // for vector layers - kept loose since exact structure is internal to GeoView.
    getLegend: () => { legend?: unknown } | undefined;
  }

  type Extent = [number, number, number, number]; // [minX, minY, maxX, maxY]
  type Coordinate = [number, number]; // [x, y]

  type FitOptions = {
    padding: [number, number, number, number],
    maxZoom: number,
    duration: number,
  };


}

export {};
