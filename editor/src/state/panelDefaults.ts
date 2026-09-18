import type { Panel } from '@/types/StoryConfig';
import { nextKey, type DraftPanel } from './editorModel';

export const PANEL_TYPE_LABELS: Record<Panel['type'], string> = {
  text: 'Text',
  image: 'Image',
  video: 'Video',
  map: 'Map',
  'manual-poi-map': 'Manual POI Map',
  'auto-poi-map': 'Auto POI Map',
  quote: 'Quote',
  slideshow: 'Slideshow',
  doormat: 'Doormat (link grid)',
};

export const PANEL_TYPES = Object.keys(PANEL_TYPE_LABELS) as Panel['type'][];

/** A reasonable, valid-enough default so a newly-added panel renders immediately in the preview. */
export const createDefaultPanel = (type: Panel['type']): DraftPanel => {
  const _key = nextKey();
  switch (type) {
    case 'text':
      return { _key, type, content: 'New text panel' };
    case 'image':
      return { _key, type, src: '' };
    case 'video':
      return { _key, type, src: '', videoType: 'embed' };
    case 'map':
      return { _key, type, config: '' }; // Placeholder path - filled in once a real GeoView map config exists
    case 'manual-poi-map':
      return { _key, type, config: '', points: [] };
    case 'auto-poi-map':
      return { _key, type, config: '', layerId: '' };
    case 'quote':
      return { _key, type, quote: 'Quote text' };
    case 'slideshow':
      return { _key, type, items: [] };
    case 'doormat':
      return { _key, type, items: [] };
  }
};
