import React from 'react';
import { MenuItem, TextField, Typography } from '@mui/material';
import { Stack } from './ui/Stack';
import type { DraftConfig } from '../state/editorModel';

interface TopLevelEditorProps {
  config: DraftConfig;
  onChange: (patch: Partial<Omit<DraftConfig, 'slides'>>) => void;
}

/** Story-wide fields plus the intro slide - everything on StoryConfig other than `slides`. */
export const TopLevelEditor: React.FC<TopLevelEditorProps> = ({ config, onChange }) => {
  const themeName = typeof config.theme === 'string' ? config.theme : config.theme?.name ?? '';

  return (
    <Stack gap={2}>
      <Typography variant="h6">Story settings</Typography>

      <TextField
        select
        label="Language"
        value={config.lang ?? 'en'}
        onChange={(e) => onChange({ lang: e.target.value as 'en' | 'fr' })}
        size="small"
        fullWidth
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="fr">Français</MenuItem>
      </TextField>

      <TextField
        select
        label="Theme"
        value={themeName || '__system__'}
        onChange={(e) => onChange({ theme: e.target.value === '__system__' ? undefined : e.target.value })}
        size="small"
        fullWidth
      >
        <MenuItem value="__system__">Follow visitor's OS/browser preference</MenuItem>
        <MenuItem value="light">Light</MenuItem>
        <MenuItem value="dark">Dark</MenuItem>
      </TextField>

      <TextField
        select
        label="Table of contents layout"
        value={config.tocOrientation ?? 'vertical'}
        onChange={(e) => onChange({ tocOrientation: e.target.value as 'vertical' | 'horizontal' })}
        size="small"
        fullWidth
      >
        <MenuItem value="vertical">Vertical (side drawer)</MenuItem>
        <MenuItem value="horizontal">Horizontal (top bar)</MenuItem>
      </TextField>

      <TextField
        label="Table of contents heading"
        value={config.tocHeading ?? ''}
        onChange={(e) => onChange({ tocHeading: e.target.value || undefined })}
        size="small"
        fullWidth
      />

      <Typography variant="subtitle1">Intro slide</Typography>
      <TextField
        label="Title"
        value={config.introSlide?.title ?? ''}
        onChange={(e) => onChange({ introSlide: e.target.value ? { ...config.introSlide, title: e.target.value } : undefined })}
        size="small"
        fullWidth
        helperText="Leave blank to skip the intro slide entirely"
      />
      {config.introSlide && (
        <>
          <TextField
            label="Subtitle"
            value={config.introSlide.subtitle ?? ''}
            onChange={(e) => onChange({ introSlide: { ...config.introSlide!, subtitle: e.target.value || undefined } })}
            size="small"
            fullWidth
          />
          <TextField
            label="Background image"
            value={config.introSlide.backgroundImage ?? ''}
            onChange={(e) => onChange({ introSlide: { ...config.introSlide!, backgroundImage: e.target.value || undefined } })}
            size="small"
            fullWidth
          />
        </>
      )}
    </Stack>
  );
};
