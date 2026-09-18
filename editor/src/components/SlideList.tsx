import React from 'react';
import { Box, Button, IconButton, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { Stack } from './ui/Stack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { DraftSlide } from '../state/editorModel';

interface SlideListProps {
  slides: DraftSlide[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}

export const SlideList: React.FC<SlideListProps> = ({ slides, selectedIndex, onSelect, onAdd, onRemove, onMove }) => {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle1">Slides</Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={onAdd}>
          Add
        </Button>
      </Stack>
      <List dense disablePadding>
        {slides.map((slide, index) => (
          <Stack key={slide._key} direction="row" alignItems="center">
            <ListItemButton selected={index === selectedIndex} onClick={() => onSelect(index)} sx={{ flex: 1 }}>
              <ListItemText primary={slide.title || 'Untitled slide'} secondary={`Level ${slide.level ?? 1}`} />
            </ListItemButton>
            <Stack>
              <IconButton size="small" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label="Move slide up">
                <ArrowUpwardIcon fontSize="inherit" />
              </IconButton>
              <IconButton size="small" onClick={() => onMove(index, 1)} disabled={index === slides.length - 1} aria-label="Move slide down">
                <ArrowDownwardIcon fontSize="inherit" />
              </IconButton>
            </Stack>
            <IconButton size="small" onClick={() => onRemove(index)} aria-label="Remove slide">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </List>
    </Box>
  );
};
