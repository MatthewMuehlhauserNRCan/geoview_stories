import { useCallback, useReducer } from 'react';
import type { Panel } from '@/types/StoryConfig';
import { createBlankConfig, nextKey, type DraftConfig, type DraftPanel, type DraftSlide } from './editorModel';
import { createDefaultPanel } from './panelDefaults';

type Action =
  | { type: 'SET_CONFIG'; config: DraftConfig }
  | { type: 'UPDATE_TOP_LEVEL'; patch: Partial<Omit<DraftConfig, 'slides'>> }
  | { type: 'ADD_SLIDE' }
  | { type: 'REMOVE_SLIDE'; slideIndex: number }
  | { type: 'MOVE_SLIDE'; slideIndex: number; direction: -1 | 1 }
  | { type: 'UPDATE_SLIDE'; slideIndex: number; patch: Partial<Omit<DraftSlide, 'rows' | '_key'>> }
  | { type: 'ADD_PANEL_ROW'; slideIndex: number }
  | { type: 'REMOVE_PANEL_ROW'; slideIndex: number; rowIndex: number }
  | { type: 'MOVE_PANEL_ROW'; slideIndex: number; rowIndex: number; direction: -1 | 1 }
  | { type: 'ADD_PANEL'; slideIndex: number; rowIndex: number; panelType: Panel['type'] }
  | { type: 'REMOVE_PANEL'; slideIndex: number; rowIndex: number; panelIndex: number }
  | { type: 'MOVE_PANEL'; slideIndex: number; rowIndex: number; panelIndex: number; direction: -1 | 1 }
  | { type: 'UPDATE_PANEL'; slideIndex: number; rowIndex: number; panelIndex: number; patch: Partial<DraftPanel> };

const moveItem = <T,>(arr: T[], index: number, direction: -1 | 1): T[] => {
  const target = index + direction;
  if (target < 0 || target >= arr.length) return arr;
  const next = arr.slice();
  [next[index], next[target]] = [next[target], next[index]];
  return next;
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
          i === action.slideIndex ? { ...slide, rows: [...slide.rows, []] } : slide
        ),
      };
    case 'REMOVE_PANEL_ROW':
      return {
        ...state,
        slides: state.slides.map((slide, i) =>
          i === action.slideIndex ? { ...slide, rows: slide.rows.filter((_, r) => r !== action.rowIndex) } : slide
        ),
      };
    case 'MOVE_PANEL_ROW':
      return {
        ...state,
        slides: state.slides.map((slide, i) =>
          i === action.slideIndex ? { ...slide, rows: moveItem(slide.rows, action.rowIndex, action.direction) } : slide
        ),
      };
    case 'ADD_PANEL':
      return {
        ...state,
        slides: state.slides.map((slide, i) =>
          i === action.slideIndex
            ? {
                ...slide,
                rows: slide.rows.map((row, r) =>
                  r === action.rowIndex ? [...row, createDefaultPanel(action.panelType)] : row
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
                rows: slide.rows.map((row, r) =>
                  r === action.rowIndex ? row.filter((_, p) => p !== action.panelIndex) : row
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
                rows: slide.rows.map((row, r) =>
                  r === action.rowIndex ? moveItem(row, action.panelIndex, action.direction) : row
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
                rows: slide.rows.map((row, r) =>
                  r === action.rowIndex
                    ? row.map((panel, p) => (p === action.panelIndex ? ({ ...panel, ...action.patch } as DraftPanel) : panel))
                    : row
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
    addPanelRow: useCallback((slideIndex: number) => dispatch({ type: 'ADD_PANEL_ROW', slideIndex }), []),
    removePanelRow: useCallback((slideIndex: number, rowIndex: number) => dispatch({ type: 'REMOVE_PANEL_ROW', slideIndex, rowIndex }), []),
    movePanelRow: useCallback(
      (slideIndex: number, rowIndex: number, direction: -1 | 1) => dispatch({ type: 'MOVE_PANEL_ROW', slideIndex, rowIndex, direction }),
      []
    ),
    addPanel: useCallback(
      (slideIndex: number, rowIndex: number, panelType: Panel['type']) => dispatch({ type: 'ADD_PANEL', slideIndex, rowIndex, panelType }),
      []
    ),
    removePanel: useCallback(
      (slideIndex: number, rowIndex: number, panelIndex: number) => dispatch({ type: 'REMOVE_PANEL', slideIndex, rowIndex, panelIndex }),
      []
    ),
    movePanel: useCallback(
      (slideIndex: number, rowIndex: number, panelIndex: number, direction: -1 | 1) =>
        dispatch({ type: 'MOVE_PANEL', slideIndex, rowIndex, panelIndex, direction }),
      []
    ),
    updatePanel: useCallback(
      (slideIndex: number, rowIndex: number, panelIndex: number, patch: Partial<DraftPanel>) =>
        dispatch({ type: 'UPDATE_PANEL', slideIndex, rowIndex, panelIndex, patch }),
      []
    ),
  };
};
