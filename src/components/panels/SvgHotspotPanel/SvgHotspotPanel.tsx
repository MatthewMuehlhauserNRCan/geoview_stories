import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { Box, Typography } from '@mui/material';
import type { SvgHotspot, SvgHotspotPanel as SvgHotspotPanelType } from '@/types/StoryConfig';
import { runInteraction } from '@/core/interactions/runInteraction';
import { useStoryConfig } from '@/core/stores/StoryStore';
import { useScrollToSlide } from '@/hooks/useScrollToSlide';
import { generateSlideId } from '@/utils/configLoader';
import { getSxClasses, HOTSPOT_CLASS, SHADOW_STYLES } from './SvgHotspotPanel-style';

const INTERACTION_LINK_PREFIX = '#interaction:';
const UNSAFE_HREF = /^\s*(javascript|data|vbscript):/i;
const SVG_NS = 'http://www.w3.org/2000/svg';

interface SvgHotspotPanelProps {
  panel: SvgHotspotPanelType;
}

const isExternal = (hotspot: SvgHotspot): boolean => hotspot.external ?? /^https?:\/\//i.test(hotspot.href);

/** Fetches the SVG file and returns it sanitized - scripts, event handlers, foreignObject, etc. stripped. */
const loadSanitizedSvg = async (src: string): Promise<string> => {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Failed to load ${src}: ${res.statusText}`);
  const raw = await res.text();
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: true },
    // DOM-clobbering protection strips ids that collide with document/form property names (e.g.
    // "title", "images") - which would silently break hotspots targeting them. Not needed here,
    // since the markup goes into a shadow root and named property access only sees the document tree.
    SANITIZE_DOM: false,
  });
};

/**
 * Lets an SVG made outside this app (Illustrator, Inkscape, Figma, ...) act as a clickable
 * graphic: each `hotspots` entry binds an element inside the SVG, by its own `id`, to a link.
 *
 * The SVG is inlined (an <img> can't expose its inner elements) into a shadow root, so its own
 * <style> blocks (e.g. Illustrator's `.cls-1 { ... }`) and ids can't leak into or collide with
 * the rest of the page - including a second copy of the same graphic elsewhere in the story.
 */
export const SvgHotspotPanel: React.FC<SvgHotspotPanelProps> = ({ panel }) => {
  const classes = getSxClasses();
  const hostRef = useRef<HTMLDivElement>(null);
  const scrollToSlide = useScrollToSlide(64);
  const slides = useStoryConfig()?.slides;
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const altText = panel.altText || 'Interactive graphic';

  useEffect(() => {
    setSvgMarkup(null);
    setError(null);
    if (!panel.src) return;
    let cancelled = false;
    loadSanitizedSvg(panel.src)
      .then((markup) => {
        if (!cancelled) setSvgMarkup(markup);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [panel.src]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || svgMarkup === null) return;
    // Reused rather than re-attached - attachShadow throws if called twice on the same element
    // (e.g. StrictMode's double effect run, or the markup/hotspots changing in the editor).
    const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${SHADOW_STYLES}</style>${svgMarkup}`;

    const svg = root.querySelector('svg');
    if (!svg) {
      setError(`${panel.src} does not contain an <svg> element`);
      return;
    }

    // Without a viewBox, an SVG with fixed width/height attributes can't scale to the column.
    const width = parseFloat(svg.getAttribute('width') ?? '');
    const height = parseFloat(svg.getAttribute('height') ?? '');
    if (!svg.hasAttribute('viewBox') && width > 0 && height > 0) {
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }
    // role="img" would hide the hotspot links inside it from assistive tech, so use a labelled
    // group whenever there's anything interactive to reach.
    svg.setAttribute('role', panel.hotspots.length ? 'group' : 'img');
    svg.setAttribute('aria-label', altText);

    const activate = (hotspot: SvgHotspot): void => {
      const { href } = hotspot;
      if (href.startsWith(INTERACTION_LINK_PREFIX)) {
        runInteraction(href.slice(INTERACTION_LINK_PREFIX.length)).catch((err) =>
          console.error('[SvgHotspotPanel] Interaction failed:', err)
        );
      } else if (href.startsWith('#')) {
        // Authors reference a slide by its own `id`; the rendered section's DOM id also carries
        // an index prefix (see generateSlideId), so map one to the other.
        const target = href.slice(1);
        const index = slides?.findIndex((slide) => slide.id === target) ?? -1;
        const slideId = index >= 0 && slides ? generateSlideId(index, slides[index].title, target) : target;
        if (document.getElementById(slideId)) void scrollToSlide(slideId);
        else window.location.hash = href;
      } else if (UNSAFE_HREF.test(href)) {
        console.warn(`[SvgHotspotPanel] Ignoring unsafe hotspot href "${href}"`);
      } else if (isExternal(hotspot)) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.assign(href);
      }
    };

    panel.hotspots.forEach((hotspot) => {
      if (!hotspot.targetId || !hotspot.href) return;
      const el = root.getElementById(hotspot.targetId);
      if (!(el instanceof SVGElement)) {
        console.warn(`[SvgHotspotPanel] No element with id "${hotspot.targetId}" found in ${panel.src}`);
        return;
      }
      const label = isExternal(hotspot) ? `${hotspot.label} (opens in new tab)` : hotspot.label;
      el.classList.add(HOTSPOT_CLASS);
      el.setAttribute('role', 'link');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', label);
      // Native hover tooltip - an SVG <title> must be the element's first child to apply to it.
      el.querySelector(':scope > title')?.remove();
      const title = document.createElementNS(SVG_NS, 'title');
      title.textContent = label;
      el.prepend(title);

      el.addEventListener('click', () => activate(hotspot));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate(hotspot);
        }
      });
    });
  }, [svgMarkup, panel.hotspots, panel.src, altText, scrollToSlide, slides]);

  return (
    <Box sx={classes.wrapper}>
      <Box component="figure" sx={classes.figure}>
        {error ? (
          <Typography color="error" variant="body2" sx={{ p: 2 }}>
            {error}
          </Typography>
        ) : (
          svgMarkup !== null && <Box ref={hostRef} sx={classes.svgHost} />
        )}
        {panel.caption && (
          <Box component="figcaption" sx={classes.caption}>
            <Typography variant="body2" color="text.primary">
              {panel.caption}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
