import type {
  GroupPanel,
  Panel,
  Slide,
  StoryConfig,
} from '@/types/StoryConfig';
import { getSlideRows } from '@/utils/configLoader';

/**
 * The editor's own in-memory model mirrors StoryConfig/Slide/Panel almost exactly, but adds a
 * stable `_key` (for React list keys / reordering) and always keeps a slide's panels as rows
 * (`Panel[][]`), even for the single-row common case - so the UI never has to special-case the
 * `Panel[] | Panel[][]` overload that the real schema allows. Both are stripped/collapsed back
 * out again in `toStoryConfig`.
 *
 * A `group` panel is recursive - it holds its own nested `panel: Panel[] | Panel[][]` - so its
 * draft form gets the same `panel` -> `rows: DraftPanel[][]` treatment as a slide, rather than a
 * flat `_key` tacked onto the raw `panel` field, letting the editor UI recurse into a group's own
 * rows using the exact same row/panel editing components as a slide's top-level rows.
 */
export type DraftPanel =
  | (Exclude<Panel, GroupPanel> & { _key: string })
  | (Omit<GroupPanel, 'panel'> & { _key: string; rows: DraftPanel[][] });
export interface DraftSlide extends Omit<Slide, 'panel'> {
  _key: string;
  rows: DraftPanel[][];
}
export interface DraftConfig extends Omit<StoryConfig, 'slides'> {
  slides: DraftSlide[];
}

let keyCounter = 0;
/** Generates a stable-enough local id for React keys - never sent to the exported JSON. */
export const nextKey = (): string => `k${++keyCounter}_${Date.now().toString(36)}`;

/** Recursively converts a real Panel (including nested group rows) into its draft form. */
const toDraftPanel = (panel: Panel): DraftPanel => {
  if (panel.type === 'group') {
    const { panel: nestedPanel, ...rest } = panel;
    return { ...rest, _key: nextKey(), rows: getSlideRows(nestedPanel).map((row) => row.map(toDraftPanel)) };
  }
  return { ...panel, _key: nextKey() };
};

/** Recursively converts a draft panel (including nested group rows) back into a real Panel. */
const toRealPanel = (draft: DraftPanel): Panel => {
  if (draft.type === 'group') {
    const { _key, rows, ...rest } = draft;
    const cleanRows = rows.map((row) => row.map(toRealPanel));
    return { ...rest, panel: cleanRows.length <= 1 ? cleanRows[0] ?? [] : cleanRows };
  }
  const { _key, ...rest } = draft;
  return rest as Panel;
};

/** A minimal starter story so the preview isn't just blank/erroring on first load. */
export const createBlankConfig = (): DraftConfig => ({
  lang: 'en',
  slides: [
    {
      _key: nextKey(),
      title: 'Untitled slide',
      level: 1,
      rows: [[{ _key: nextKey(), type: 'text', content: 'Start writing here...' }]],
    },
  ],
});

/** Converts a real StoryConfig (e.g. imported from a JSON file) into the editor's draft model. */
export const fromStoryConfig = (config: StoryConfig): DraftConfig => ({
  ...config,
  slides: config.slides.map((slide): DraftSlide => {
    const { panel, ...rest } = slide;
    return {
      ...rest,
      _key: nextKey(),
      rows: getSlideRows(panel).map((row) => row.map(toDraftPanel)),
    };
  }),
});

/** Converts the editor's draft model back into a plain, exportable StoryConfig. */
export const toStoryConfig = (draft: DraftConfig): StoryConfig => ({
  ...draft,
  slides: draft.slides.map((slide): Slide => {
    const { _key, rows, ...rest } = slide;
    const cleanRows = rows.map((row) => row.map(toRealPanel));
    return {
      ...rest,
      // Collapse back to a flat Panel[] for the common single-row case, so exported JSON matches
      // how most hand-authored configs already look rather than always nesting one extra level.
      panel: cleanRows.length <= 1 ? cleanRows[0] ?? [] : cleanRows,
    };
  }),
});
