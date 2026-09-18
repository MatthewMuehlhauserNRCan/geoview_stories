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

interface PanelEditorProps {
  panel: DraftPanel;
  onChange: (patch: Partial<DraftPanel>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const PanelEditor: React.FC<PanelEditorProps> = ({ panel, onChange, onRemove, onMove, canMoveUp, canMoveDown }) => {
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
        <PanelFieldsEditor panel={panel} onChange={onChange} />
        <Typography variant="caption" color="text.secondary">
          Layout
        </Typography>
        <CommonPanelFields panel={panel} onChange={onChange} />
      </Stack>
    </Paper>
  );
};
