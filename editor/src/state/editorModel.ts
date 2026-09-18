import type {
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
 */
export type DraftPanel = Panel & { _key: string };
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
      rows: getSlideRows(panel).map((row) => row.map((p) => ({ ...p, _key: nextKey() }))),
    };
  }),
});

/** Converts the editor's draft model back into a plain, exportable StoryConfig. */
export const toStoryConfig = (draft: DraftConfig): StoryConfig => ({
  ...draft,
  slides: draft.slides.map((slide): Slide => {
    const { _key, rows, ...rest } = slide;
    const cleanRows = rows.map((row) => row.map(({ _key, ...panel }) => panel as Panel));
    return {
      ...rest,
      // Collapse back to a flat Panel[] for the common single-row case, so exported JSON matches
      // how most hand-authored configs already look rather than always nesting one extra level.
      panel: cleanRows.length <= 1 ? cleanRows[0] ?? [] : cleanRows,
    };
  }),
});
