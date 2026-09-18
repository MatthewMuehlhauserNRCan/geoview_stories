import React, { useRef } from 'react';
import { AppBar, Button, Toolbar as MuiToolbar, Typography } from '@mui/material';
import { Stack } from './ui/Stack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import type { StoryConfig } from '@/types/StoryConfig';

interface ToolbarProps {
  onImport: (config: StoryConfig) => void;
  onExport: () => StoryConfig;
  onReset: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onImport, onExport, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // Allow re-importing the same file path twice in a row
    if (!file) return;
    try {
      const config = JSON.parse(await file.text()) as StoryConfig;
      onImport(config);
    } catch (err) {
      window.alert(`Couldn't parse that file as JSON: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleExport = () => {
    const config = onExport();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'story-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <MuiToolbar variant="dense">
        <Typography variant="subtitle1" sx={{ flex: 1 }}>
          GeoView Story - Config Builder
        </Typography>
        <Stack direction="row" gap={1}>
          <Button size="small" startIcon={<UploadFileIcon />} onClick={handleImportClick}>
            Import JSON
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleFileChosen} />
          <Button size="small" startIcon={<DownloadIcon />} onClick={handleExport} variant="contained">
            Export JSON
          </Button>
          <Button size="small" startIcon={<RestartAltIcon />} onClick={onReset} color="warning">
            New
          </Button>
        </Stack>
      </MuiToolbar>
    </AppBar>
  );
};
