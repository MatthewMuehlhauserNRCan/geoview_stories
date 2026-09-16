export interface PoiZoomTarget {
  extent?: Extent;
  zoom?: number;
  returnHome?: boolean;
}

/**
 * Cancels any in-flight animation before starting the next one, so back-to-back POI activations
 * (e.g. a fast scroll) don't fight each other instead of the latest one cleanly winning.
 */
export const zoomToPoiTarget = (mapViewer: GeoviewMapViewer, target: PoiZoomTarget, duration: number): Promise<void> => {
  mapViewer.getView().cancelAnimations();

  if (target.returnHome) {
    return mapViewer.controllers.mapController.zoomToInitialExtent();
  }

  if (target.extent) {
    const fitOptions = {
      padding: [100, 100, 100, 100] as [number, number, number, number],
      maxZoom: target.zoom ?? 10,
      duration,
    };
    return mapViewer.controllers.mapController.zoomToExtent(target.extent, true, fitOptions);
  }

  return Promise.resolve();
};
