import type { Interaction } from '@/types/StoryConfig';

export const INTERACTION_TYPE_LABELS: Record<Interaction['type'], string> = {
  'zoom-to-extent': 'Zoom to extent',
  'zoom-to-point': 'Zoom to point',
  'zoom-to-feature': 'Zoom to feature',
  'zoom-to-layer-extent': 'Zoom to layer extent',
  'zoom-to-initial-extent': 'Zoom to initial extent (home)',
  'set-layer-visibility': 'Set layer visibility',
  'add-layer': 'Add layer',
};

export const INTERACTION_TYPES = Object.keys(INTERACTION_TYPE_LABELS) as Interaction['type'][];

let idCounter = 0;
/** Generates a reasonable-looking default interaction id - authors are free to rename it. */
export const nextInteractionId = (): string => `interaction-${++idCounter}`;

/** A reasonable, valid-enough default so a newly-added interaction is usable immediately. */
export const createDefaultInteraction = (type: Interaction['type'], mapId: string): Interaction => {
  const id = nextInteractionId();
  switch (type) {
    case 'zoom-to-extent':
      return { id, type, mapId, extent: [-100, 45, -90, 55] };
    case 'zoom-to-point':
      return { id, type, mapId, center: [-100, 50] };
    case 'zoom-to-feature':
      return { id, type, mapId, layerId: '', oid: '' };
    case 'zoom-to-layer-extent':
      return { id, type, mapId, layerId: '' };
    case 'zoom-to-initial-extent':
      return { id, type, mapId };
    case 'set-layer-visibility':
      return { id, type, mapId, layerId: '', visible: true };
    case 'add-layer':
      return { id, type, mapId, layerConfig: {} };
  }
};
