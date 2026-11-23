import React, { useEffect, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Box, Button, IconButton, MenuItem, Switch, TextField, Typography } from '@mui/material';
import { Stack } from './ui/Stack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { DoormatItem, InteractionButton, PanelStyle, PointOfInterest, SlideshowItem, SvgHotspot } from '@/types/StoryConfig';
import type { DraftPanel } from '../state/editorModel';
import { assetIdFromRef, getAsset, isAssetRef, saveAsset } from '../state/assetStore';
import { AssetField } from './AssetField';
import { RowsEditor } from './RowsEditor';
import type { useEditorState } from '../state/useEditorState';

interface PanelFieldsProps {
  panel: DraftPanel;
  onChange: (patch: Partial<DraftPanel>) => void;
  // Only used by the 'group' case below, to recurse into the group's own nested rows with
  // RowsEditor - unused (but harmless to pass) for every other panel type.
  slideIndex: number;
  groupPath: number[];
  actions: ReturnType<typeof useEditorState>;
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

// Elements that never render on their own, so an id on them (or inside them) can't be a hotspot.
const NON_RENDERED_SVG = 'defs, clipPath, mask, linearGradient, radialGradient, pattern, filter, symbol, marker, style, title, desc, metadata';

/** Reads the SVG at `src` (an uploaded asset or a reachable URL) and lists the ids of its visible elements. */
const useSvgElementIds = (src: string | undefined): string[] => {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds([]);
    if (!src) return;
    let cancelled = false;
    const loadText = isAssetRef(src)
      ? getAsset(assetIdFromRef(src)).then((stored) => stored?.blob.text() ?? '')
      : fetch(src).then((res) => (res.ok ? res.text() : ''));
    loadText
      .then((text) => {
        if (cancelled || !text) return;
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        const found = Array.from(doc.querySelectorAll('[id]'))
          .filter((el) => el !== doc.documentElement && !el.closest(NON_RENDERED_SVG))
          .map((el) => el.id);
        setIds([...new Set(found)]);
      })
      // A path the editor itself can't reach just means no suggestions - ids can still be typed.
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [src]);
  return ids;
};

const SvgHotspotsFields: React.FC<{
  panel: Extract<DraftPanel, { type: 'svg-hotspots' }>;
  onChange: (patch: Partial<DraftPanel>) => void;
  interactionIds: string[];
}> = ({ panel, onChange, interactionIds }) => {
  const svgIds = useSvgElementIds(panel.src);
  return (
    <Stack gap={1.5}>
      <AssetField label="SVG file" value={panel.src} onChange={(v) => onChange({ src: v ?? '' })} accept="image/svg+xml,.svg" />
      <Field label="Alt text" value={panel.altText} onChange={(v) => onChange({ altText: v })} />
      <Field label="Caption" value={panel.caption} onChange={(v) => onChange({ caption: v })} />
      <RepeatableList<SvgHotspot>
        label="Hotspots"
        items={panel.hotspots}
        onChange={(hotspots) => onChange({ hotspots })}
        createItem={() => ({ targetId: '', label: '', href: '' })}
        renderItem={(item, _i, update) => {
          const unknownId = !!item.targetId && svgIds.length > 0 && !svgIds.includes(item.targetId);
          return (
            <Stack gap={1}>
              <Autocomplete
                freeSolo
                options={svgIds}
                inputValue={item.targetId}
                onInputChange={(_e, v) => update({ targetId: v })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="SVG element id"
                    size="small"
                    error={unknownId}
                    helperText={
                      unknownId
                        ? 'No visible element with this id in the SVG'
                        : svgIds.length
                          ? `${svgIds.length} element ids found in the SVG`
                          : 'The id attribute of the shape/group to make clickable'
                    }
                  />
                )}
              />
              <Field label="Label (tooltip and screen reader text)" value={item.label} onChange={(v) => update({ label: v })} />
              <Field
                label="Link"
                value={item.href}
                onChange={(v) => update({ href: v })}
                helperText={`A URL, #<slide id>, or #interaction:<id>${interactionIds.length ? ` (available: ${interactionIds.join(', ')})` : ''}`}
              />
              <BoolField
                label="Opens in new tab (default on for http(s) URLs)"
                value={item.external ?? /^https?:\/\//i.test(item.href)}
                onChange={(v) => update({ external: v })}
              />
            </Stack>
          );
        }}
      />
    </Stack>
  );
};

/** Renders the field editor for whichever panel type this draft panel currently is. */
export const PanelFieldsEditor: React.FC<PanelFieldsProps> = ({ panel, onChange, slideIndex, groupPath, actions }) => {
  switch (panel.type) {
    case 'text':
      return (
        <Stack gap={1.5}>
          <Field label="Content (Markdown)" value={panel.content} multiline onChange={(v) => onChange({ content: v })} />
          <AssetField
            label="Content file (overrides content above if set)"
            value={panel.contentFile}
            onChange={(v) => onChange({ contentFile: v })}
            accept=".md,.markdown,text/markdown"
          />
        </Stack>
      );

    case 'image':
      return (
        <Stack gap={1.5}>
          <AssetField label="Image" value={panel.src} onChange={(v) => onChange({ src: v ?? '' })} accept="image/*" />
          <Field label="Alt text" value={panel.altText} onChange={(v) => onChange({ altText: v })} />
          <Field label="Caption" value={panel.caption} onChange={(v) => onChange({ caption: v })} />
          <BoolField label="Fullscreen on click (default on)" value={panel.fullscreen ?? true} onChange={(v) => onChange({ fullscreen: v })} />
        </Stack>
      );

    case 'svg-hotspots':
      return (
        <SvgHotspotsFields
          panel={panel}
          onChange={onChange}
          interactionIds={actions.config.interactions?.map((i) => i.id) ?? []}
        />
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
          {panel.videoType === 'local' ? (
            <AssetField label="Video file" value={panel.src} onChange={(v) => onChange({ src: v ?? '' })} accept="video/*" />
          ) : (
            <Field label="Src / embed URL" value={panel.src} onChange={(v) => onChange({ src: v })} />
          )}
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
          <AssetField
            kind="mapconfig"
            label="Map config"
            value={panel.config}
            onChange={(v) => onChange({ config: v ?? '' })}
            accept="application/json,.json"
            helperText="Path to a GeoView map config JSON, or attach the file to keep track of it - either way, this map just shows its own loading state in the preview until a real, reachable config exists."
          />
          <BoolField label="Scroll guard (Ctrl/Cmd + scroll to zoom)" value={panel.scrollguard} onChange={(v) => onChange({ scrollguard: v })} />
        </Stack>
      );

    case 'manual-poi-map':
      return (
        <Stack gap={1.5}>
          <AssetField
            kind="mapconfig"
            label="Map config"
            value={panel.config}
            onChange={(v) => onChange({ config: v ?? '' })}
            accept="application/json,.json"
            helperText="Attach the file to keep track of it - it won't load in the preview until deployed with a real, reachable path."
          />
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
                <Stack direction="row" gap={1} alignItems="flex-end">
                  <Field
                    label="Image (single URL, or comma-separated for a gallery)"
                    value={Array.isArray(point.image) ? point.image.join(',') : point.image}
                    onChange={(v) => update({ image: v.includes(',') ? v.split(',').map((s) => s.trim()) : v })}
                  />
                  <Button
                    size="small"
                    component="label"
                    sx={{ flexShrink: 0, mb: 0.5 }}
                  >
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (!file) return;
                        const ref = `asset:${await saveAsset(file)}`;
                        const existing = point.image ? (Array.isArray(point.image) ? point.image : [point.image]) : [];
                        update({ image: [...existing, ref] });
                      }}
                    />
                  </Button>
                </Stack>
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
          <AssetField
            kind="mapconfig"
            label="Map config"
            value={panel.config}
            onChange={(v) => onChange({ config: v ?? '' })}
            accept="application/json,.json"
            helperText="Attach the file to keep track of it - it won't load in the preview until deployed with a real, reachable path."
          />
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
                <AssetField label="Image" value={item.src} onChange={(v) => update({ src: v ?? '' })} accept="image/*" />
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

    case 'group':
      return (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            A group holds its own nested rows of panels, laid out the same way as a slide's own rows.
          </Typography>
          <RowsEditor slideIndex={slideIndex} groupPath={groupPath} rows={panel.rows} actions={actions} />
        </Box>
      );

    case 'button-group':
      return (
        <Stack gap={1.5}>
          <TextField
            select
            label="Direction"
            value={panel.direction ?? 'row'}
            onChange={(e) => onChange({ direction: e.target.value as 'row' | 'column' })}
            size="small"
            fullWidth
          >
            <MenuItem value="row">Row</MenuItem>
            <MenuItem value="column">Column</MenuItem>
          </TextField>
          <RepeatableList<InteractionButton>
            label="Buttons"
            items={panel.buttons}
            onChange={(buttons) => onChange({ buttons })}
            createItem={() => ({ label: 'New button', interactionId: '' })}
            renderItem={(item, _i, update) => (
              <Stack gap={1}>
                <Field label="Label" value={item.label} onChange={(v) => update({ label: v })} />
                <Field
                  label="Interaction id"
                  value={item.interactionId}
                  onChange={(v) => update({ interactionId: v })}
                  helperText={
                    actions.config.interactions?.length
                      ? `Available: ${actions.config.interactions.map((i) => i.id).join(', ')}`
                      : 'No interactions configured yet - add one in Story settings.'
                  }
                />
                <TextField
                  select
                  label="Variant"
                  value={item.variant ?? 'contained'}
                  onChange={(e) => update({ variant: e.target.value as InteractionButton['variant'] })}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="contained">Contained</MenuItem>
                  <MenuItem value="outlined">Outlined</MenuItem>
                  <MenuItem value="text">Text</MenuItem>
                </TextField>
              </Stack>
            )}
          />
        </Stack>
      );
  }
};

/** Fields shared by every panel type, rendered above the type-specific fields. */
export const CommonPanelFields: React.FC<{ panel: DraftPanel; onChange: (patch: Partial<DraftPanel>) => void }> = ({
  panel,
  onChange,
}) => (
  <Field
    label='cssClasses (e.g. "narrow right-align")'
    value={panel.cssClasses}
    onChange={(v) => onChange({ cssClasses: v || undefined })}
  />
);

type OnOffDefault = '' | 'on' | 'off';
const toOnOff = (v: boolean | undefined): OnOffDefault => (v === undefined ? '' : v ? 'on' : 'off');
const fromOnOff = (v: string): boolean | undefined => (v === '' ? undefined : v === 'on');
const toLength = (v: string): string | number | undefined => (v === '' ? undefined : /^\d+(\.\d+)?$/.test(v) ? Number(v) : v);

/** Optional per-panel look overrides (`panel.style`) - collapsed by default since most panels won't use it. */
export const PanelStyleFields: React.FC<{ panel: DraftPanel; onChange: (patch: Partial<DraftPanel>) => void }> = ({
  panel,
  onChange,
}) => {
  const style: PanelStyle = panel.style ?? {};
  const update = (patch: Partial<PanelStyle>) => {
    const next = Object.fromEntries(
      Object.entries({ ...style, ...patch }).filter(([, v]) => v !== undefined && v !== '')
    ) as PanelStyle;
    onChange({ style: Object.keys(next).length ? next : undefined });
  };
  const isCustomBorder = typeof style.border === 'object';
  // Captured once - Accordion's defaultExpanded must not change after mount.
  const [initiallyExpanded] = useState(!!panel.style);

  return (
    <Accordion disableGutters elevation={0} variant="outlined" defaultExpanded={initiallyExpanded}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body2">Style overrides{panel.style ? ` (${Object.keys(panel.style).length})` : ''}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack gap={1.5}>
          <Stack direction="row" gap={1}>
            <TextField
              select
              label="Border"
              value={isCustomBorder ? 'custom' : toOnOff(style.border as boolean | undefined)}
              onChange={(e) => e.target.value !== 'custom' && update({ border: fromOnOff(e.target.value) })}
              size="small"
              fullWidth
              helperText={isCustomBorder ? 'Custom border object - edit in JSON' : undefined}
            >
              <MenuItem value="">Default</MenuItem>
              <MenuItem value="off">None</MenuItem>
              <MenuItem value="on">Show</MenuItem>
              {isCustomBorder && <MenuItem value="custom">Custom</MenuItem>}
            </TextField>
            <TextField
              select
              label="Shadow"
              value={toOnOff(style.shadow)}
              onChange={(e) => update({ shadow: fromOnOff(e.target.value) })}
              size="small"
              fullWidth
            >
              <MenuItem value="">Default</MenuItem>
              <MenuItem value="off">None</MenuItem>
              <MenuItem value="on">Show</MenuItem>
            </TextField>
          </Stack>
          <Stack direction="row" gap={1}>
            <Field label="Border radius (px or CSS)" value={style.borderRadius} onChange={(v) => update({ borderRadius: toLength(v) })} />
            <Field label="Padding (px or CSS)" value={style.padding} onChange={(v) => update({ padding: toLength(v) })} />
          </Stack>
          <Field label="Background color" value={style.backgroundColor} onChange={(v) => update({ backgroundColor: v })} />
          <Field label="Text color" value={style.color} onChange={(v) => update({ color: v })} />
          <Field
            label="Accent color"
            value={style.accentColor}
            onChange={(v) => update({ accentColor: v })}
            helperText="Theme primary color within this panel (links, buttons, highlights)"
          />
          <Field label="Font family" value={style.fontFamily} onChange={(v) => update({ fontFamily: v })} />
          <Stack direction="row" gap={1}>
            <Field label="Overlay color" value={style.overlayColor} onChange={(v) => update({ overlayColor: v })} />
            <Field label="Overlay hover color" value={style.overlayHoverColor} onChange={(v) => update({ overlayHoverColor: v })} />
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
