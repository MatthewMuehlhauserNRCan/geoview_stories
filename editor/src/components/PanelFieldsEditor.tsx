import React from 'react';
import { Box, Button, IconButton, MenuItem, Switch, TextField, Typography } from '@mui/material';
import { Stack } from './ui/Stack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type {
  DoormatItem,
  ManualPoiMapPanel,
  PointOfInterest,
  SlideshowItem,
} from '@/types/StoryConfig';
import type { DraftPanel } from '../state/editorModel';

interface PanelFieldsProps {
  panel: DraftPanel;
  onChange: (patch: Partial<DraftPanel>) => void;
}

/** A labeled text input bound directly to one field of the panel being edited. */
const Field: React.FC<{
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
  helperText?: string;
}> = ({ label, value, onChange, multiline, type, helperText }) => (
  <TextField
    label={label}
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value)}
    multiline={multiline}
    minRows={multiline ? 3 : undefined}
    type={type}
    size="small"
    fullWidth
    helperText={helperText}
  />
);

const BoolField: React.FC<{ label: string; value: boolean | undefined; onChange: (value: boolean) => void }> = ({
  label,
  value,
  onChange,
}) => (
  <Stack direction="row" alignItems="center" gap={1}>
    <Switch checked={!!value} onChange={(e) => onChange(e.target.checked)} />
    <Typography variant="body2">{label}</Typography>
  </Stack>
);

/** Generic add/remove/edit list, used for points[]/items[] arrays shared by a few panel types. */
function RepeatableList<T>({
  label,
  items,
  onChange,
  createItem,
  renderItem,
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  renderItem: (item: T, index: number, update: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2">{label}</Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={() => onChange([...items, createItem()])}>
          Add
        </Button>
      </Stack>
      <Stack gap={1.5}>
        {items.map((item, index) => (
          <Box key={index} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, position: 'relative' }}>
            <IconButton
              size="small"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              sx={{ position: 'absolute', top: 4, right: 4 }}
              aria-label={`Remove ${label} ${index + 1}`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            {renderItem(item, index, (patch) => {
              const next = items.slice();
              next[index] = { ...next[index], ...patch };
              onChange(next);
            })}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

/** Renders the field editor for whichever panel type this draft panel currently is. */
export const PanelFieldsEditor: React.FC<PanelFieldsProps> = ({ panel, onChange }) => {
  switch (panel.type) {
    case 'text':
      return (
        <Stack gap={1.5}>
          <Field label="Content (Markdown)" value={panel.content} multiline onChange={(v) => onChange({ content: v })} />
          <Field label="Content file path (overrides content if set)" value={panel.contentFile} onChange={(v) => onChange({ contentFile: v || undefined })} />
        </Stack>
      );

    case 'image':
      return (
        <Stack gap={1.5}>
          <Field label="Image src" value={panel.src} onChange={(v) => onChange({ src: v })} />
          <Field label="Alt text" value={panel.altText} onChange={(v) => onChange({ altText: v })} />
          <Field label="Caption" value={panel.caption} onChange={(v) => onChange({ caption: v })} />
          <BoolField label="Fullscreen on click (default on)" value={panel.fullscreen ?? true} onChange={(v) => onChange({ fullscreen: v })} />
        </Stack>
      );

    case 'video':
      return (
        <Stack gap={1.5}>
          <TextField
            select
            label="Video type"
            value={panel.videoType}
            onChange={(e) => onChange({ videoType: e.target.value as typeof panel.videoType })}
            size="small"
            fullWidth
          >
            <MenuItem value="embed">Embed (YouTube/Vimeo/etc. iframe URL)</MenuItem>
            <MenuItem value="local">Local video file</MenuItem>
            <MenuItem value="external">External video file URL</MenuItem>
          </TextField>
          <Field label="Src / embed URL" value={panel.src} onChange={(v) => onChange({ src: v })} />
          <Field label="Caption track src" value={panel.caption} onChange={(v) => onChange({ caption: v })} />
          <Field label="Transcript link" value={panel.transcript} onChange={(v) => onChange({ transcript: v })} />
          <Field label="Width" value={panel.width} onChange={(v) => onChange({ width: v })} />
          <Field label="Height cap (embed only)" type="number" value={panel.height} onChange={(v) => onChange({ height: v ? Number(v) : undefined })} />
          <BoolField label="Autoplay" value={panel.autoplay} onChange={(v) => onChange({ autoplay: v })} />
        </Stack>
      );

    case 'map':
      return (
        <Stack gap={1.5}>
          <Field
            label="Map config path"
            value={panel.config}
            onChange={(v) => onChange({ config: v })}
            helperText="Path to a GeoView map config JSON - leave as a placeholder until one exists; this map will just show its own loading state until then."
          />
          <BoolField label="Scroll guard (Ctrl/Cmd + scroll to zoom)" value={panel.scrollguard} onChange={(v) => onChange({ scrollguard: v })} />
        </Stack>
      );

    case 'manual-poi-map':
      return (
        <Stack gap={1.5}>
          <Field label="Map config path" value={panel.config} onChange={(v) => onChange({ config: v })} helperText="Placeholder is fine for now." />
          <Field label="Default link label" value={panel.linkLabel} onChange={(v) => onChange({ linkLabel: v })} />
          <Field label="Zoom duration (ms)" type="number" value={panel.duration} onChange={(v) => onChange({ duration: v ? Number(v) : undefined })} />
          <TextField
            select
            label="Map position"
            value={panel.mapPosition ?? 'left'}
            onChange={(e) => onChange({ mapPosition: e.target.value as 'left' | 'right' })}
            size="small"
            fullWidth
          >
            <MenuItem value="left">Left</MenuItem>
            <MenuItem value="right">Right</MenuItem>
          </TextField>
          <BoolField label="Scroll guard" value={panel.scrollguard} onChange={(v) => onChange({ scrollguard: v })} />
          <RepeatableList<PointOfInterest>
            label="Points of interest"
            items={panel.points}
            onChange={(points) => onChange({ points })}
            createItem={() => ({ target: {} })}
            renderItem={(point, _i, update) => (
              <Stack gap={1}>
                <Field label="Title" value={point.title} onChange={(v) => update({ title: v })} />
                <Field label="Text" value={point.text} onChange={(v) => update({ text: v })} multiline />
                <Field
                  label="Image (single URL, or comma-separated for a gallery)"
                  value={Array.isArray(point.image) ? point.image.join(',') : point.image}
                  onChange={(v) => update({ image: v.includes(',') ? v.split(',').map((s) => s.trim()) : v })}
                />
                <Field label="Link URL" value={point.linkUrl} onChange={(v) => update({ linkUrl: v })} />
                <Field label="Target layer id" value={point.target.layerId} onChange={(v) => update({ target: { ...point.target, layerId: v } })} />
                <Field label="Target OID" value={point.target.oid} onChange={(v) => update({ target: { ...point.target, oid: v } })} />
                <Field label="Static value label" value={point.target.value} onChange={(v) => update({ target: { ...point.target, value: v } })} />
                <Field
                  label="Target scale (e.g. 50000)"
                  type="number"
                  value={point.target.scale}
                  onChange={(v) => update({ target: { ...point.target, scale: v ? Number(v) : undefined } })}
                />
                <BoolField
                  label="Return to map's home view instead"
                  value={point.target.returnHome}
                  onChange={(v) => update({ target: { ...point.target, returnHome: v } })}
                />
              </Stack>
            )}
          />
        </Stack>
      );

    case 'auto-poi-map':
      return (
        <Stack gap={1.5}>
          <Field label="Map config path" value={panel.config} onChange={(v) => onChange({ config: v })} helperText="Placeholder is fine for now." />
          <Field label="Layer id" value={panel.layerId} onChange={(v) => onChange({ layerId: v })} />
          <Field label="Title field" value={panel.titleField} onChange={(v) => onChange({ titleField: v })} />
          <Field label="Text field" value={panel.textField} onChange={(v) => onChange({ textField: v })} />
          <Field label="Link field" value={panel.linkField} onChange={(v) => onChange({ linkField: v })} />
          <Field label="Link label" value={panel.linkLabel} onChange={(v) => onChange({ linkLabel: v })} />
          <Field label="Image field" value={panel.imageField} onChange={(v) => onChange({ imageField: v })} />
          <Field label="Sort field" value={panel.sortField} onChange={(v) => onChange({ sortField: v })} />
          <TextField
            select
            label="Sort direction"
            value={panel.sortDirection ?? 'asc'}
            onChange={(e) => onChange({ sortDirection: e.target.value as 'asc' | 'desc' })}
            size="small"
            fullWidth
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </TextField>
          <Field label="Target scale" type="number" value={panel.scale} onChange={(v) => onChange({ scale: v ? Number(v) : undefined })} />
          <Field label="Zoom duration (ms)" type="number" value={panel.duration} onChange={(v) => onChange({ duration: v ? Number(v) : undefined })} />
          <TextField
            select
            label="Map position"
            value={panel.mapPosition ?? 'left'}
            onChange={(e) => onChange({ mapPosition: e.target.value as 'left' | 'right' })}
            size="small"
            fullWidth
          >
            <MenuItem value="left">Left</MenuItem>
            <MenuItem value="right">Right</MenuItem>
          </TextField>
          <BoolField label="Scroll guard" value={panel.scrollguard} onChange={(v) => onChange({ scrollguard: v })} />
          <Typography variant="caption" color="text.secondary">
            `filter` (which subset of features become POIs) isn't editable here yet - import/edit that field via raw JSON if needed.
          </Typography>
        </Stack>
      );

    case 'quote':
      return (
        <Stack gap={1.5}>
          <Field label="Quote" value={panel.quote} multiline onChange={(v) => onChange({ quote: v })} />
          <Field label="Author" value={panel.author} onChange={(v) => onChange({ author: v })} />
          <Field label="Role" value={panel.role} onChange={(v) => onChange({ role: v })} />
          <Field label="Organization" value={panel.organization} onChange={(v) => onChange({ organization: v })} />
        </Stack>
      );

    case 'slideshow':
      return (
        <Stack gap={1.5}>
          <BoolField label="Loop" value={panel.loop} onChange={(v) => onChange({ loop: v })} />
          <TextField
            select
            label="Object fit"
            value={panel.objectFit ?? 'cover'}
            onChange={(e) => onChange({ objectFit: e.target.value as typeof panel.objectFit })}
            size="small"
            fullWidth
          >
            {(['cover', 'contain', 'fill', 'none', 'scale-down'] as const).map((v) => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </TextField>
          <RepeatableList<SlideshowItem>
            label="Images"
            items={panel.items}
            onChange={(items) => onChange({ items })}
            createItem={() => ({ src: '' })}
            renderItem={(item, _i, update) => (
              <Stack gap={1}>
                <Field label="Src" value={item.src} onChange={(v) => update({ src: v })} />
                <Field label="Alt text" value={item.altText} onChange={(v) => update({ altText: v })} />
                <Field label="Overlay text" value={item.text} onChange={(v) => update({ text: v })} multiline />
                <TextField
                  select
                  label="Text position"
                  value={item.textPosition ?? 'left'}
                  onChange={(e) => update({ textPosition: e.target.value as 'left' | 'right' })}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                </TextField>
              </Stack>
            )}
          />
        </Stack>
      );

    case 'doormat':
      return (
        <RepeatableList<DoormatItem>
          label="Links"
          items={panel.items}
          onChange={(items) => onChange({ items })}
          createItem={() => ({ title: '', href: '' })}
          renderItem={(item, _i, update) => (
            <Stack gap={1}>
              <Field label="Title" value={item.title} onChange={(v) => update({ title: v })} />
              <Field label="Href" value={item.href} onChange={(v) => update({ href: v })} />
              <Field label="Description" value={item.description} onChange={(v) => update({ description: v })} multiline />
              <BoolField label="Opens in new tab (default on)" value={item.external ?? true} onChange={(v) => update({ external: v })} />
            </Stack>
          )}
        />
      );
  }
};

/** Fields shared by every panel type, rendered above the type-specific fields. */
export const CommonPanelFields: React.FC<PanelFieldsProps> = ({ panel, onChange }) => (
  <Field
    label='cssClasses (e.g. "narrow right-align")'
    value={panel.cssClasses}
    onChange={(v) => onChange({ cssClasses: v || undefined })}
  />
);
