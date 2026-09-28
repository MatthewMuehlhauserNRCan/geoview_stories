import React from 'react';
import { MenuItem, TextField, Typography, Switch } from '@mui/material';
import { Stack } from './ui/Stack';
import type { DraftSlide } from '../state/editorModel';
import { RowsEditor } from './RowsEditor';
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

      <RowsEditor slideIndex={slideIndex} groupPath={[]} rows={slide.rows} actions={actions} />
    </Stack>
  );
};
