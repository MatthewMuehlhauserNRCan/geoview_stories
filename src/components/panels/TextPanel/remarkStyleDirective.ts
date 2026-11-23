import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

// Fixed set of inline/block style classes an author can apply via a `style` directive (e.g.
// `:style[important context]{.accent}` or a `:::style{.lead}` block). Keeping this list fixed -
// rather than letting story authors supply arbitrary CSS or raw HTML - keeps every style
// theme-aware (so it adapts to light/dark/custom themes) and keeps colour contrast/sizing choices
// reviewable up front (WCAG 1.4.3/1.4.4) instead of ad hoc per-story values. See TextPanel-style.ts
// for the corresponding `.md-*` class definitions.
export const STYLE_DIRECTIVE_CLASSES = ['lead', 'small', 'accent', 'muted', 'highlight'] as const;
export type StyleDirectiveClass = (typeof STYLE_DIRECTIVE_CLASSES)[number];

const ALLOWED_CLASSES = new Set<string>(STYLE_DIRECTIVE_CLASSES);

/**
 * remark plugin (used alongside `remark-directive`, which parses the `:name[...]{...}`/`:::name`
 * syntax into mdast directive nodes) that turns a `style` directive into a plain `<span>` (inline)
 * or `<div>` (block) carrying only allowlisted `md-*` classes. Any other directive name, and any
 * attribute other than `class`, is left untouched - so story content can't introduce arbitrary
 * styling, inline HTML, or attributes (e.g. event handlers) this way.
 */
export function remarkStyleDirective() {
  return (tree: Root) => {
    visit(tree, (node) => {
      const type = node.type as string;
      if (type !== 'textDirective' && type !== 'leafDirective' && type !== 'containerDirective') return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const directive = node as any;
      if (directive.name !== 'style') return;

      const rawClass = typeof directive.attributes?.class === 'string' ? directive.attributes.class : '';
      const classes = rawClass
        .split(/\s+/)
        .filter((c: string) => ALLOWED_CLASSES.has(c))
        .map((c: string) => `md-${c}`);

      directive.data = {
        ...directive.data,
        hName: type === 'textDirective' ? 'span' : 'div',
        hProperties: classes.length ? { className: classes } : {},
      };
    });
  };
}
