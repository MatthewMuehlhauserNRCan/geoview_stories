import React from 'react';
import { Box, Button, MenuItem, TextField, Typography, IconButton, Switch } from '@mui/material';
import { Stack } from './ui/Stack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { Panel } from '@/types/StoryConfig';
import type { DraftSlide } from '../state/editorModel';
import { PANEL_TYPE_LABELS, PANEL_TYPES } from '../state/panelDefaults';
import { PanelEditor } from './PanelEditor';
import type { useEditorState } from '../state/useEditorState';

interface SlideEditorProps {
  slide: DraftSlide;
  slideIndex: number;
  actions: ReturnType<typeof useEditorState>;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({ slide, slideIndex, actions }) => {
  return (
    <Stack gap={2}>
      <Typography variant="h6">Slide {slideIndex + 1}</Typography>

      <TextField
        label="Title"
        value={slide.title}
        onChange={(e) => actions.updateSlide(slideIndex, { title: e.target.value })}
        size="small"
        fullWidth
      />

      <Stack direction="row" gap={2}>
        <TextField
          select
          label="Heading level"
          value={slide.level ?? 1}
          onChange={(e) => actions.updateSlide(slideIndex, { level: Number(e.target.value) as 1 | 2 | 3 | 4 })}
          size="small"
          sx={{ minWidth: 160 }}
        >
          {[1, 2, 3, 4].map((l) => (
            <MenuItem key={l} value={l}>
              Level {l} {l === 1 ? '(new section)' : '(nests under prior section)'}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Stable id (optional)"
          value={slide.id ?? ''}
          onChange={(e) => actions.updateSlide(slideIndex, { id: e.target.value || undefined })}
          size="small"
          sx={{ flex: 1 }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" gap={1}>
        <Switch
          checked={slide.includeInToc ?? true}
          onChange={(e) => actions.updateSlide(slideIndex, { includeInToc: e.target.checked })}
        />
        <Typography variant="body2">Include in table of contents</Typography>
      </Stack>

      <TextField
        label="Background image"
        value={slide.backgroundImage ?? ''}
        onChange={(e) => actions.updateSlide(slideIndex, { backgroundImage: e.target.value || undefined })}
        size="small"
        fullWidth
      />
      {slide.backgroundImage && (
        <TextField
          label="Background scrim opacity (0-1, dark mode only)"
          type="number"
          value={slide.backgroundScrimOpacity ?? ''}
          onChange={(e) =>
            actions.updateSlide(slideIndex, { backgroundScrimOpacity: e.target.value ? Number(e.target.value) : undefined })
          }
          size="small"
          fullWidth
        />
      )}

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle1">Panel rows</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => actions.addPanelRow(slideIndex)}>
            Add row
          </Button>
        </Stack>

        <Stack gap={2}>
          {slide.rows.map((row, rowIndex) => (
            <Box key={rowIndex} sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Row {rowIndex + 1} {row.length > 1 ? '(panels laid out side by side)' : ''}
                </Typography>
                <Stack direction="row">
                  <IconButton size="small" onClick={() => actions.movePanelRow(slideIndex, rowIndex, -1)} disabled={rowIndex === 0}>
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => actions.movePanelRow(slideIndex, rowIndex, 1)}
                    disabled={rowIndex === slide.rows.length - 1}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => actions.removePanelRow(slideIndex, rowIndex)} aria-label="Remove row">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              <Stack gap={1.5}>
                {row.map((panel, panelIndex) => (
                  <PanelEditor
                    key={panel._key}
                    panel={panel}
                    onChange={(patch) => actions.updatePanel(slideIndex, rowIndex, panelIndex, patch)}
                    onRemove={() => actions.removePanel(slideIndex, rowIndex, panelIndex)}
                    onMove={(direction) => actions.movePanel(slideIndex, rowIndex, panelIndex, direction)}
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
                onChange={(e) => actions.addPanel(slideIndex, rowIndex, e.target.value as Panel['type'])}
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
    </Stack>
  );
};
