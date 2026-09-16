/**
 * Best-effort layer style swatch: exact per-feature class matching (for uniqueValue/classBreaks
 * styles) needs GeoView's internal renderer logic, which isn't exposed externally, so this just
 * takes the layer's default/first icon.
 */
export const getLayerLegendIconDataUrl = (layer: GeoviewLayer): string | undefined => {
  try {
    const legend = layer.getLegend?.()?.legend;
    if (!legend) return undefined;

    if (legend instanceof HTMLCanvasElement) {
      return legend.toDataURL();
    }

    for (const geometryStyle of Object.values(legend as Record<string, any>)) {
      const canvas = geometryStyle?.defaultCanvas ?? geometryStyle?.arrayOfCanvas?.[0];
      if (canvas instanceof HTMLCanvasElement) return canvas.toDataURL();
    }
  } catch (err) {
    console.warn('[PoiMap] Could not read layer legend:', err);
  }
  return undefined;
};
