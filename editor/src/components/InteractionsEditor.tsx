import React, { useState } from 'react';
import { Box, Button, IconButton, MenuItem, Switch, TextField, Typography } from '@mui/material';
import { Stack } from './ui/Stack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Interaction } from '@/types/StoryConfig';
import { INTERACTION_TYPE_LABELS, INTERACTION_TYPES, createDefaultInteraction } from '../state/interactionDefaults';

interface InteractionsEditorProps {
  interactions: Interaction[] | undefined;
  onChange: (interactions: Interaction[]) => void;
}

const NumberField: React.FC<{ label: string; value: number | undefined; onChange: (value: number) => void }> = ({
  label,
  value,
  onChange,
}) => (
  <TextField
    label={label}
    type="number"
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
    size="small"
    fullWidth
  />
);

/** Commits its edits only on blur, so an in-progress (temporarily invalid) JSON edit isn't
 * immediately discarded/reverted by a re-render from the last successfully parsed value. */
const JsonField: React.FC<{ label: string; value: Record<string, unknown>; onChange: (value: Record<string, unknown>) => void }> = ({
  label,
  value,
  onChange,
}) => {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  return (
    <TextField
      label={label}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        try {
          onChange(JSON.parse(text));
        } catch {
          // Invalid JSON - leave the text as typed until it's fixed; last valid value is unchanged.
        }
      }}
      size="small"
      fullWidth
      multiline
      minRows={4}
      helperText="Raw GeoView layer config (geoviewLayerId, geoviewLayerType, metadataAccessPath, listOfLayerEntryConfig, etc.)"
    />
  );
};

/** Authors the story-wide `interactions` list - named, reusable map actions triggered from a
 * button-group panel's buttons or a `#interaction:<id>` link inside any text panel. */
export const InteractionsEditor: React.FC<InteractionsEditorProps> = ({ interactions, onChange }) => {
  const list = interactions ?? [];

  const update = (index: number, patch: Partial<Interaction>) => {
    onChange(list.map((item, i) => (i === index ? ({ ...item, ...patch } as Interaction) : item)));
  };

  return (
    <Stack gap={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1">Interactions</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => onChange([...list, createDefaultInteraction('zoom-to-initial-extent', '')])}
        >
          Add interaction
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Named, reusable map actions - reference an interaction's id from a Button group panel's buttons, or from a
        `#interaction:&lt;id&gt;` link inside any text panel.
      </Typography>

      <Stack gap={2}>
        {list.map((interaction, index) => (
          <Box key={index} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, position: 'relative' }}>
            <IconButton
              size="small"
              onClick={() => onChange(list.filter((_, i) => i !== index))}
              sx={{ position: 'absolute', top: 4, right: 4 }}
              aria-label={`Remove interaction ${index + 1}`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>

            <Stack gap={1.5} sx={{ pr: 4 }}>
              <Stack direction="row" gap={1.5}>
                <TextField label="Id" value={interaction.id} onChange={(e) => update(index, { id: e.target.value })} size="small" sx={{ flex: 1 }} />
                <TextField
                  select
                  label="Type"
                  value={interaction.type}
                  onChange={(e) => update(index, createDefaultInteraction(e.target.value as Interaction['type'], interaction.mapId))}
                  size="small"
                  sx={{ minWidth: 220 }}
                >
                  {INTERACTION_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {INTERACTION_TYPE_LABELS[t]}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <TextField
                label="Map id"
                value={interaction.mapId}
                onChange={(e) => update(index, { mapId: e.target.value })}
                size="small"
                fullWidth
                helperText="Matches a map/manual-poi-map/auto-poi-map panel's own `id` field, not the real GeoView mapId"
              />

              {interaction.type === 'zoom-to-extent' && (
                <>
                  <Stack direction="row" gap={1.5}>
                    <NumberField label="Min lon" value={interaction.extent[0]} onChange={(v) => update(index, { extent: [v, interaction.extent[1], interaction.extent[2], interaction.extent[3]] })} />
                    <NumberField label="Min lat" value={interaction.extent[1]} onChange={(v) => update(index, { extent: [interaction.extent[0], v, interaction.extent[2], interaction.extent[3]] })} />
                    <NumberField label="Max lon" value={interaction.extent[2]} onChange={(v) => update(index, { extent: [interaction.extent[0], interaction.extent[1], v, interaction.extent[3]] })} />
                    <NumberField label="Max lat" value={interaction.extent[3]} onChange={(v) => update(index, { extent: [interaction.extent[0], interaction.extent[1], interaction.extent[2], v] })} />
                  </Stack>
                  <Stack direction="row" gap={1.5}>
                    <NumberField label="Max zoom" value={interaction.zoom} onChange={(v) => update(index, { zoom: v })} />
                    <NumberField label="Duration (ms)" value={interaction.duration} onChange={(v) => update(index, { duration: v })} />
                  </Stack>
                </>
              )}

              {interaction.type === 'zoom-to-point' && (
                <Stack direction="row" gap={1.5}>
                  <NumberField label="Lon" value={interaction.center[0]} onChange={(v) => update(index, { center: [v, interaction.center[1]] })} />
                  <NumberField label="Lat" value={interaction.center[1]} onChange={(v) => update(index, { center: [interaction.center[0], v] })} />
                  <NumberField label="Max zoom" value={interaction.zoom} onChange={(v) => update(index, { zoom: v })} />
                  <NumberField label="Duration (ms)" value={interaction.duration} onChange={(v) => update(index, { duration: v })} />
                </Stack>
              )}

              {interaction.type === 'zoom-to-feature' && (
                <>
                  <TextField label="Layer id (geoviewLayerId/layerId)" value={interaction.layerId} onChange={(e) => update(index, { layerId: e.target.value })} size="small" fullWidth />
                  <TextField label="Object id (OID)" value={interaction.oid} onChange={(e) => update(index, { oid: e.target.value })} size="small" fullWidth />
                  <Stack direction="row" gap={1.5}>
                    <NumberField label="Zoom" value={interaction.zoom} onChange={(v) => update(index, { zoom: v })} />
                    <NumberField label="Scale" value={interaction.scale} onChange={(v) => update(index, { scale: v })} />
                    <NumberField label="Duration (ms)" value={interaction.duration} onChange={(v) => update(index, { duration: v })} />
                  </Stack>
                </>
              )}

              {interaction.type === 'zoom-to-layer-extent' && (
                <TextField label="Layer id" value={interaction.layerId} onChange={(e) => update(index, { layerId: e.target.value })} size="small" fullWidth />
              )}

              {interaction.type === 'set-layer-visibility' && (
                <>
                  <TextField label="Layer id" value={interaction.layerId} onChange={(e) => update(index, { layerId: e.target.value })} size="small" fullWidth />
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Switch checked={interaction.visible} onChange={(e) => update(index, { visible: e.target.checked })} />
                    <Typography variant="body2">Visible</Typography>
                  </Stack>
                </>
              )}

              {interaction.type === 'add-layer' && (
                <JsonField label="Layer config (JSON)" value={interaction.layerConfig} onChange={(v) => update(index, { layerConfig: v })} />
              )}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
};
