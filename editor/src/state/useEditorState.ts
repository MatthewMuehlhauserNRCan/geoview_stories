import { useCallback, useReducer } from 'react';
import type { Panel } from '@/types/StoryConfig';
import { createBlankConfig, nextKey, type DraftConfig, type DraftPanel, type DraftSlide } from './editorModel';
import { createDefaultPanel } from './panelDefaults';

// A path of (rowIndex, panelIndex) hops identifying which group panel's own nested `rows` array
// an action targets - [] means the slide's own top-level rows; [0, 1] means "descend into the
// group panel at rows[0][1] and act on its rows"; [0, 1, 2, 0] descends one group deeper, etc.
type GroupPath = number[];

type Action =
  | { type: 'SET_CONFIG'; config: DraftConfig }
  | { type: 'UPDATE_TOP_LEVEL'; patch: Partial<Omit<DraftConfig, 'slides'>> }
  | { type: 'ADD_SLIDE' }
  | { type: 'REMOVE_SLIDE'; slideIndex: number }
  | { type: 'MOVE_SLIDE'; slideIndex: number; direction: -1 | 1 }
  | { type: 'UPDATE_SLIDE'; slideIndex: number; patch: Partial<Omit<DraftSlide, 'rows' | '_key'>> }
  | { type: 'ADD_PANEL_ROW'; slideIndex: number; groupPath: GroupPath }
  | { type: 'REMOVE_PANEL_ROW'; slideIndex: number; groupPath: GroupPath; rowIndex: number }
  | { type: 'MOVE_PANEL_ROW'; slideIndex: number; groupPath: GroupPath; rowIndex: number; direction: -1 | 1 }
  | { type: 'ADD_PANEL'; slideIndex: number; groupPath: GroupPath; rowIndex: number; panelType: Panel['type'] }
  | { type: 'REMOVE_PANEL'; slideIndex: number; groupPath: GroupPath; rowIndex: number; panelIndex: number }
  | { type: 'MOVE_PANEL'; slideIndex: number; groupPath: GroupPath; rowIndex: number; panelIndex: number; direction: -1 | 1 }
  | { type: 'UPDATE_PANEL'; slideIndex: number; groupPath: GroupPath; rowIndex: number; panelIndex: number; patch: Partial<DraftPanel> };

const moveItem = <T,>(arr: T[], index: number, direction: -1 | 1): T[] => {
  const target = index + direction;
  if (target < 0 || target >= arr.length) return arr;
  const next = arr.slice();
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

/**
 * Locates the `rows` array `groupPath.length / 2` group-panels deep inside `rows` (each hop
 * descends into the group panel at `rows[rowIndex][panelIndex]`) and applies `updater` to it -
 * lets every row/panel action below work identically whether it's editing a slide's own rows or
 * the nested rows of a group panel found anywhere inside them.
 */
const updateRowsAtPath = (rows: DraftPanel[][], groupPath: GroupPath, updater: (rows: DraftPanel[][]) => DraftPanel[][]): DraftPanel[][] => {
  if (groupPath.length === 0) return updater(rows);
  const [rowIndex, panelIndex, ...rest] = groupPath;
  return rows.map((row, r) => {
    if (r !== rowIndex) return row;
    return row.map((panel, p) => {
      if (p !== panelIndex || panel.type !== 'group') return panel;
      return { ...panel, rows: updateRowsAtPath(panel.rows, rest, updater) };
    });
  });
};

const reducer = (state: DraftConfig, action: Action): DraftConfig => {
  switch (action.type) {
    case 'SET_CONFIG':
      return action.config;
    case 'UPDATE_TOP_LEVEL':
      return { ...state, ...action.patch };
    case 'ADD_SLIDE':
      return {
        ...state,
        slides: [...state.slides, { _key: nextKey(), title: 'Untitled slide', level: 1, rows: [] }],
      };
    case 'REMOVE_SLIDE':
      return { ...state, slides: state.slides.filter((_, i) => i !== action.slideIndex) };
    case 'MOVE_SLIDE':
      return { ...state, slides: moveItem(state.slides, action.slideIndex, action.direction) };
    case 'UPDATE_SLIDE':
      return {
        ...state,
        slides: state.slides.map((slide, i) => (i === action.slideIndex ? { ...slide, ...action.patch } : slide)),
      };
    case 'ADD_PANEL_ROW':
      return {
        ...state,
        slides: state.slides.map((slide, i) =>
          i === action.slideIndex
            ? { ...slide, rows: updateRowsAtPath(slide.rows, action.groupPath, (rows) => [...rows, []]) }
            : slide
        ),
      };
    case 'REMOVE_PANEL_ROW':
      return {
        ...state,
        slides: state.slides.map((slide, i) =>
          i === action.slideIndex
            ? {
                ...slide,
                rows: updateRowsAtPath(slide.rows, action.groupPath, (rows) => rows.filter((_, r) => r !== action.rowIndex)),
              }
            : slide
        ),
      };
    case 'MOVE_PANEL_ROW':
      return {
        ...state,
        slides: state.slides.map((slide, i) =>
          i === action.slideIndex
            ? {
                ...slide,
                rows: updateRowsAtPath(slide.rows, action.groupPath, (rows) => moveItem(rows, action.rowIndex, action.direction)),
              }
            : slide
        ),
      };
    case 'ADD_PANEL':
      return {
        ...state,
        slides: state.slides.map((slide, i) =>
          i === action.slideIndex
            ? {
                ...slide,
                rows: updateRowsAtPath(slide.rows, action.groupPath, (rows) =>
                  rows.map((row, r) => (r === action.rowIndex ? [...row, createDefaultPanel(action.panelType)] : row))
                ),
              }
            : slide
        ),
      };
    case 'REMOVE_PANEL':
      return {
        ...state,
        slides: state.slides.map((slide, i) =>
          i === action.slideIndex
            ? {
                ...slide,
                rows: updateRowsAtPath(slide.rows, action.groupPath, (rows) =>
                  rows.map((row, r) => (r === action.rowIndex ? row.filter((_, p) => p !== action.panelIndex) : row))
                ),
              }
            : slide
        ),
      };
    case 'MOVE_PANEL':
      return {
        ...state,
        slides: state.slides.map((slide, i) =>
          i === action.slideIndex
            ? {
                ...slide,
                rows: updateRowsAtPath(slide.rows, action.groupPath, (rows) =>
                  rows.map((row, r) => (r === action.rowIndex ? moveItem(row, action.panelIndex, action.direction) : row))
                ),
              }
            : slide
        ),
      };
    case 'UPDATE_PANEL':
      return {
        ...state,
        slides: state.slides.map((slide, i) =>
          i === action.slideIndex
            ? {
                ...slide,
                rows: updateRowsAtPath(slide.rows, action.groupPath, (rows) =>
                  rows.map((row, r) =>
                    r === action.rowIndex
                      ? row.map((panel, p) => (p === action.panelIndex ? ({ ...panel, ...action.patch } as DraftPanel) : panel))
                      : row
                  )
                ),
              }
            : slide
        ),
      };
    default:
      return state;
  }
};

/** Owns the editor's draft StoryConfig and every mutation the UI can make to it. */
export const useEditorState = () => {
  const [config, dispatch] = useReducer(reducer, undefined, createBlankConfig);

  return {
    config,
    setConfig: useCallback((next: DraftConfig) => dispatch({ type: 'SET_CONFIG', config: next }), []),
    updateTopLevel: useCallback((patch: Partial<Omit<DraftConfig, 'slides'>>) => dispatch({ type: 'UPDATE_TOP_LEVEL', patch }), []),
    addSlide: useCallback(() => dispatch({ type: 'ADD_SLIDE' }), []),
    removeSlide: useCallback((slideIndex: number) => dispatch({ type: 'REMOVE_SLIDE', slideIndex }), []),
    moveSlide: useCallback((slideIndex: number, direction: -1 | 1) => dispatch({ type: 'MOVE_SLIDE', slideIndex, direction }), []),
    updateSlide: useCallback(
      (slideIndex: number, patch: Partial<Omit<DraftSlide, 'rows' | '_key'>>) => dispatch({ type: 'UPDATE_SLIDE', slideIndex, patch }),
      []
    ),
    addPanelRow: useCallback(
      (slideIndex: number, groupPath: GroupPath) => dispatch({ type: 'ADD_PANEL_ROW', slideIndex, groupPath }),
      []
    ),
    removePanelRow: useCallback(
      (slideIndex: number, groupPath: GroupPath, rowIndex: number) => dispatch({ type: 'REMOVE_PANEL_ROW', slideIndex, groupPath, rowIndex }),
      []
    ),
    movePanelRow: useCallback(
      (slideIndex: number, groupPath: GroupPath, rowIndex: number, direction: -1 | 1) =>
        dispatch({ type: 'MOVE_PANEL_ROW', slideIndex, groupPath, rowIndex, direction }),
      []
    ),
    addPanel: useCallback(
      (slideIndex: number, groupPath: GroupPath, rowIndex: number, panelType: Panel['type']) =>
        dispatch({ type: 'ADD_PANEL', slideIndex, groupPath, rowIndex, panelType }),
      []
    ),
    removePanel: useCallback(
      (slideIndex: number, groupPath: GroupPath, rowIndex: number, panelIndex: number) =>
        dispatch({ type: 'REMOVE_PANEL', slideIndex, groupPath, rowIndex, panelIndex }),
      []
    ),
    movePanel: useCallback(
      (slideIndex: number, groupPath: GroupPath, rowIndex: number, panelIndex: number, direction: -1 | 1) =>
        dispatch({ type: 'MOVE_PANEL', slideIndex, groupPath, rowIndex, panelIndex, direction }),
      []
    ),
    updatePanel: useCallback(
      (slideIndex: number, groupPath: GroupPath, rowIndex: number, panelIndex: number, patch: Partial<DraftPanel>) =>
        dispatch({ type: 'UPDATE_PANEL', slideIndex, groupPath, rowIndex, panelIndex, patch }),
      []
    ),
  };
};
