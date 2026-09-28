import React from 'react';
import { Box, Button, MenuItem, TextField, Typography, IconButton } from '@mui/material';
import { Stack } from './ui/Stack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { Panel } from '@/types/StoryConfig';
import type { DraftPanel } from '../state/editorModel';
import { PANEL_TYPE_LABELS, PANEL_TYPES } from '../state/panelDefaults';
import { PanelEditor } from './PanelEditor';
import type { useEditorState } from '../state/useEditorState';

interface RowsEditorProps {
  slideIndex: number;
  // [] for a slide's own rows; the group panel's own (rowIndex, panelIndex) location, appended to
  // its parent's own path, when editing a group panel's nested rows (see useEditorState.ts).
  groupPath: number[];
  rows: DraftPanel[][];
  actions: ReturnType<typeof useEditorState>;
}

/** Add/remove/reorder rows and panels within a `rows: DraftPanel[][]` array - used both for a
 * slide's own top-level rows and, recursively, for a group panel's nested rows. */
export const RowsEditor: React.FC<RowsEditorProps> = ({ slideIndex, groupPath, rows, actions }) => {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle1">Panel rows</Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={() => actions.addPanelRow(slideIndex, groupPath)}>
          Add row
        </Button>
      </Stack>

      <Stack gap={2}>
        {rows.map((row, rowIndex) => (
          <Box key={rowIndex} sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Row {rowIndex + 1} {row.length > 1 ? '(panels laid out side by side)' : ''}
              </Typography>
              <Stack direction="row">
                <IconButton
                  size="small"
                  onClick={() => actions.movePanelRow(slideIndex, groupPath, rowIndex, -1)}
                  disabled={rowIndex === 0}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => actions.movePanelRow(slideIndex, groupPath, rowIndex, 1)}
                  disabled={rowIndex === rows.length - 1}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => actions.removePanelRow(slideIndex, groupPath, rowIndex)} aria-label="Remove row">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>

            <Stack gap={1.5}>
              {row.map((panel, panelIndex) => (
                <PanelEditor
                  key={panel._key}
                  slideIndex={slideIndex}
                  groupPath={groupPath}
                  rowIndex={rowIndex}
                  panelIndex={panelIndex}
                  panel={panel}
                  actions={actions}
                  onRemove={() => actions.removePanel(slideIndex, groupPath, rowIndex, panelIndex)}
                  onMove={(direction) => actions.movePanel(slideIndex, groupPath, rowIndex, panelIndex, direction)}
                  canMoveUp={panelIndex > 0}
                  canMoveDown={panelIndex < row.length - 1}
                />
              ))}
            </Stack>

            <TextField
              select
              size="small"
              value=""
              slotProps={{ select: { displayEmpty: true } }}
              onChange={(e) => actions.addPanel(slideIndex, groupPath, rowIndex, e.target.value as Panel['type'])}
              sx={{ mt: 1.5, minWidth: 220 }}
            >
              <MenuItem value="" disabled>
                + Add panel to this row...
              </MenuItem>
              {PANEL_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {PANEL_TYPE_LABELS[t]}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};
