import React from 'react';
import { Box, IconButton, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { Stack } from './ui/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { Panel } from '@/types/StoryConfig';
import type { DraftPanel } from '../state/editorModel';
import { PANEL_TYPE_LABELS, PANEL_TYPES, createDefaultPanel } from '../state/panelDefaults';
import { CommonPanelFields, PanelFieldsEditor } from './PanelFieldsEditor';
import type { useEditorState } from '../state/useEditorState';

interface PanelEditorProps {
  slideIndex: number;
  groupPath: number[];
  rowIndex: number;
  panelIndex: number;
  panel: DraftPanel;
  actions: ReturnType<typeof useEditorState>;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const PanelEditor: React.FC<PanelEditorProps> = ({
  slideIndex,
  groupPath,
  rowIndex,
  panelIndex,
  panel,
  actions,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
}) => {
  const onChange = (patch: Partial<DraftPanel>) => actions.updatePanel(slideIndex, groupPath, rowIndex, panelIndex, patch);

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <TextField
          select
          size="small"
          value={panel.type}
          onChange={(e) => onChange(createDefaultPanel(e.target.value as Panel['type']))}
          sx={{ minWidth: 180 }}
        >
          {PANEL_TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {PANEL_TYPE_LABELS[t]}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ flex: 1 }} />
        <IconButton size="small" onClick={() => onMove(-1)} disabled={!canMoveUp} aria-label="Move panel left">
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onMove(1)} disabled={!canMoveDown} aria-label="Move panel right">
          <ArrowForwardIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onRemove} aria-label="Remove panel">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Stack gap={1.5}>
        <PanelFieldsEditor
          panel={panel}
          onChange={onChange}
          slideIndex={slideIndex}
          groupPath={[...groupPath, rowIndex, panelIndex]}
          actions={actions}
        />
        <Typography variant="caption" color="text.secondary">
          Layout
        </Typography>
        <CommonPanelFields panel={panel} onChange={onChange} />
      </Stack>
    </Paper>
  );
};
