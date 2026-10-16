import type { AbstractGVLayer } from '@/types/GeoView';

/**
 * Best-effort layer style swatch: exact per-feature class matching (for uniqueValue/classBreaks
 * styles) needs GeoView's internal renderer logic, which isn't exposed externally, so this just
 * takes the layer's default/first icon.
 */
export const getLayerLegendIconDataUrl = (layer: AbstractGVLayer): string | undefined => {
  try {
    const legend = layer.getLegend()?.legend;
    if (!legend || typeof legend === 'string') return undefined; // null, or the 'AnnotationLayer' sentinel

    if (legend instanceof HTMLCanvasElement) {
      return legend.toDataURL();
    }

    // TS can't infer values of a `Partial<Record<K, V>>` through Object.values on its own.
    const styles = legend as Record<string, { defaultCanvas?: HTMLCanvasElement | null; arrayOfCanvas?: (HTMLCanvasElement | null)[] }>;
    for (const geometryStyle of Object.values(styles)) {
      const canvas = geometryStyle?.defaultCanvas ?? geometryStyle?.arrayOfCanvas?.[0];
      if (canvas instanceof HTMLCanvasElement) return canvas.toDataURL();
    }
  } catch (err) {
    console.warn('[PoiMap] Could not read layer legend:', err);
  }
  return undefined;
};
