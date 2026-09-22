import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import { Stack } from './ui/Stack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { deleteAsset, getAsset, isRefOfKind, saveAsset, idFromRef, makeRef, type AssetRefKind } from '../state/assetStore';

interface AssetFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  accept: string;
  helperText?: string;
  /** 'mapconfig' tracks a linked GeoView map config file without feeding it into the live preview
   * (see assetStore.ts) - defaults to 'asset' (images/video/markdown, resolved for real preview). */
  kind?: AssetRefKind;
}

/**
 * A path/URL field that can also hold an uploaded file - either works, since a value is just a
 * string either way (a real URL, or a stable `asset:<id>`/`mapconfig:<id>` reference into the
 * local IndexedDB store). Uploading replaces whatever URL was there; typing a URL only shows once
 * nothing is uploaded.
 */
export const AssetField: React.FC<AssetFieldProps> = ({ label, value, onChange, accept, helperText, kind = 'asset' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [asset, setAsset] = useState<{ name: string; type: string; previewUrl: string | null } | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    previewUrlRef.current && URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setAsset(null);

    if (!isRefOfKind(value, kind)) return;
    let cancelled = false;
    getAsset(idFromRef(value)).then((stored) => {
      if (cancelled || !stored) return;
      const previewUrl = stored.type.startsWith('image/') ? URL.createObjectURL(stored.blob) : null;
      previewUrlRef.current = previewUrl;
      setAsset({ name: stored.name, type: stored.type, previewUrl });
    });
    return () => {
      cancelled = true;
    };
  }, [value, kind]);

  useEffect(() => () => void (previewUrlRef.current && URL.revokeObjectURL(previewUrlRef.current)), []);

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const id = await saveAsset(file);
    onChange(makeRef(kind, id));
  };

  const handleRemove = () => {
    if (isRefOfKind(value, kind)) void deleteAsset(idFromRef(value));
    onChange(undefined);
  };

  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      {isRefOfKind(value, kind) ? (
        <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
          {asset?.previewUrl ? (
            <Box component="img" src={asset.previewUrl} alt="" sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 0.5 }} />
          ) : (
            <InsertDriveFileIcon fontSize="small" color="action" />
          )}
          <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {asset?.name ?? 'Uploaded file'}
          </Typography>
          <IconButton size="small" onClick={handleRemove} aria-label={`Remove ${label}`}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      ) : (
        <Stack direction="row" gap={1} sx={{ mt: 0.5 }}>
          <TextField
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            placeholder="URL or path"
            size="small"
            fullWidth
            helperText={helperText}
          />
          <Button size="small" startIcon={<UploadFileIcon />} onClick={() => fileInputRef.current?.click()} sx={{ flexShrink: 0 }}>
            Upload
          </Button>
        </Stack>
      )}
      <input ref={fileInputRef} type="file" accept={accept} hidden onChange={handleFileChosen} />
    </Box>
  );
};
