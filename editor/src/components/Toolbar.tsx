import React, { useRef, useState } from 'react';
import JSZip from 'jszip';
import {
  AppBar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Toolbar as MuiToolbar,
  Typography,
} from '@mui/material';
import { Stack } from './ui/Stack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import type { StoryConfig } from '@/types/StoryConfig';
import { getAsset, idFromRef, makeRef, saveAssetBlob, type AssetRefKind } from '../state/assetStore';
import { mapStrings, mapStringsAsync } from '../state/assetTree';

interface ToolbarProps {
  onImport: (config: StoryConfig) => void;
  onExport: () => StoryConfig;
  onReset: () => void;
}

const CONFIG_ENTRY_NAME = 'story-config.json';

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogg: 'video/ogg',
  mov: 'video/quicktime',
  md: 'text/markdown',
  markdown: 'text/markdown',
};

const guessMimeType = (filename: string): string => MIME_BY_EXTENSION[filename.split('.').pop()?.toLowerCase() ?? ''] ?? '';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/** Every distinct asset:/mapconfig: reference anywhere in the config, found via a regex over its
 * JSON text - simpler than a recursive walk just to collect (rather than transform) matches. */
const collectRefs = (config: StoryConfig): string[] =>
  Array.from(new Set(JSON.stringify(config).match(/(asset|mapconfig):[a-zA-Z0-9]+/g) ?? []));

/** Resolves `relPath` against `baseDir` (a zip-internal directory, no leading/trailing slash),
 * handling "./" and "../" - same convention `path.posix.join` would use, written by hand since
 * this needs to run in the browser bundle. */
const joinZipPath = (baseDir: string, relPath: string): string => {
  const stack = baseDir ? baseDir.split('/') : [];
  for (const part of relPath.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') stack.pop();
    else stack.push(part);
  }
  return stack.join('/');
};

interface ZipEntry {
  /** Normalized to forward slashes - some zip tools (e.g. Windows' Compress-Archive) write
   * backslash-separated entry names, which would otherwise break every path join/lookup below. */
  name: string;
  entry: JSZip.JSZipObject;
}

const listZipEntries = (zip: JSZip): ZipEntry[] =>
  zip
    .file(/.*/)
    .filter((f) => !f.dir)
    .map((entry) => ({ name: entry.name.replace(/\\/g, '/'), entry }));

interface PendingZipImport {
  entries: ZipEntry[];
  jsonEntries: ZipEntry[];
}

export const Toolbar: React.FC<ToolbarProps> = ({ onImport, onExport, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingZipImport | null>(null);

  const handleImportClick = () => fileInputRef.current?.click();

  /**
   * Rehydrates every field in `config` that matches a real file in the zip - resolved against
   * the chosen config entry's own directory (or, failing that, the zip root), not hardcoded to
   * an `assets/` prefix. A matched `.json` file becomes a `mapconfig:` reference (a linked
   * GeoView map config - tracked, but never fed into the live preview); anything else becomes a
   * regular `asset:` reference. Fields that don't match any file in the zip (a real absolute
   * URL, or just plain text) are left untouched.
   */
  const rehydrateConfig = async (entries: ZipEntry[], configEntryName: string): Promise<StoryConfig> => {
    const byPath = new Map(entries.map((e) => [e.name, e.entry]));
    const configEntry = byPath.get(configEntryName)!;
    const baseDir = configEntryName.includes('/') ? configEntryName.slice(0, configEntryName.lastIndexOf('/')) : '';
    const config = JSON.parse(await configEntry.async('string')) as StoryConfig;
    const resolvedCache = new Map<string, string>();

    return mapStringsAsync(config, async (value) => {
      if (!value || /^(https?:|data:|asset:|mapconfig:)/i.test(value)) return value;
      if (resolvedCache.has(value)) return resolvedCache.get(value)!;

      const candidatePath = [joinZipPath(baseDir, value), value].find((path) => path !== configEntryName && byPath.has(path));
      if (!candidatePath) return value;

      const entry = byPath.get(candidatePath)!;
      const blob = await entry.async('blob');
      const name = candidatePath.split('/').pop() ?? candidatePath;
      const kind: AssetRefKind = name.toLowerCase().endsWith('.json') ? 'mapconfig' : 'asset';
      const id = await saveAssetBlob(blob, name, guessMimeType(name));
      const ref = makeRef(kind, id);
      resolvedCache.set(value, ref);
      return ref;
    });
  };

  /**
   * Accepts either a zip this same tool exported (story-config.json + an assets/ folder) or a
   * zip of an existing story's own folder (e.g. a `configs/` + `images/` pair, possibly with
   * several map config JSON files alongside it). If it's unambiguous which .json is the main
   * story config (one named story-config.json, or just one .json file total), it's used directly;
   * otherwise the user is asked which one to treat as the entry config - the rest are just
   * candidate files other fields might reference (map configs, etc.), not configs to parse.
   */
  const importZip = async (file: File) => {
    const zip = await JSZip.loadAsync(file);
    const entries = listZipEntries(zip);
    const named = entries.find((e) => e.name.split('/').pop() === CONFIG_ENTRY_NAME);
    if (named) {
      onImport(await rehydrateConfig(entries, named.name));
      return;
    }

    const jsonEntries = entries.filter((e) => e.name.toLowerCase().endsWith('.json'));
    if (jsonEntries.length === 0) throw new Error('No .json file found in the zip.');
    if (jsonEntries.length === 1) {
      onImport(await rehydrateConfig(entries, jsonEntries[0].name));
      return;
    }

    setPending({ entries, jsonEntries });
  };

  const handlePendingChoice = async (configEntryName: string) => {
    if (!pending) return;
    try {
      onImport(await rehydrateConfig(pending.entries, configEntryName));
    } catch (err) {
      window.alert(`Couldn't import that file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setPending(null);
    }
  };

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // Allow re-importing the same file path twice in a row
    if (!file) return;

    try {
      if (file.name.toLowerCase().endsWith('.zip')) {
        await importZip(file);
      } else {
        onImport(JSON.parse(await file.text()) as StoryConfig);
      }
    } catch (err) {
      window.alert(`Couldn't import that file: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleExport = async () => {
    const config = onExport();
    const refs = collectRefs(config);

    if (refs.length === 0) {
      downloadBlob(new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' }), 'story-config.json');
      return;
    }

    const zip = new JSZip();
    const refToPath = new Map<string, string>();
    const usedNames = new Set<string>();

    for (const ref of refs) {
      const stored = await getAsset(idFromRef(ref));
      if (!stored) continue;

      const safeName = stored.name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'file';
      let candidate = safeName;
      let n = 1;
      while (usedNames.has(candidate)) {
        const dot = safeName.lastIndexOf('.');
        candidate = dot > 0 ? `${safeName.slice(0, dot)}-${++n}${safeName.slice(dot)}` : `${safeName}-${++n}`;
      }
      usedNames.add(candidate);

      refToPath.set(ref, `assets/${candidate}`);
      zip.file(`assets/${candidate}`, stored.blob);
    }

    const rewritten = mapStrings(config, (s) => refToPath.get(s) ?? s);
    zip.file(CONFIG_ENTRY_NAME, JSON.stringify(rewritten, null, 2));

    downloadBlob(await zip.generateAsync({ type: 'blob' }), 'story-config.zip');
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <MuiToolbar variant="dense">
        <Typography variant="subtitle1" sx={{ flex: 1 }}>
          GeoView Story - Config Builder
        </Typography>
        <Stack direction="row" gap={1}>
          <Button size="small" startIcon={<UploadFileIcon />} onClick={handleImportClick}>
            Import
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json,.json,.zip" hidden onChange={handleFileChosen} />
          <Button size="small" startIcon={<DownloadIcon />} onClick={handleExport} variant="contained">
            Export
          </Button>
          <Button size="small" startIcon={<RestartAltIcon />} onClick={onReset} color="warning">
            New
          </Button>
        </Stack>
      </MuiToolbar>

      <Dialog open={!!pending} onClose={() => setPending(null)}>
        <DialogTitle>Which file is the story config?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1 }}>
            This zip has more than one .json file. The rest will still be available for other fields (e.g. a map's config) to reference.
          </DialogContentText>
          <List dense>
            {pending?.jsonEntries.map((e) => (
              <ListItemButton key={e.name} onClick={() => handlePendingChoice(e.name)}>
                <ListItemText primary={e.name} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPending(null)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};
