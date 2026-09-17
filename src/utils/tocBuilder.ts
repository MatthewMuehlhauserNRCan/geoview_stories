import { Slide, StoryConfig, TocItem } from '@/types/StoryConfig';

/**
 * Builds the TOC tree straight from slide headings, like a document outline: a level-1 slide
 * (the default) is always its own top-level entry and becomes the current "section" for whatever
 * follows; a level 2-4 slide instead becomes a flat child of the nearest preceding level-1 slide,
 * until the next level-1 slide starts a new section. Slides with `includeInToc: false` produce no
 * entry at all (and can't become a section for later slides to nest under).
 */
export const buildAutoToc = (slides: Slide[]): TocItem[] => {
  const roots: TocItem[] = [];
  let currentSection: TocItem | null = null;

  slides.forEach((slide, index) => {
    if (slide.includeInToc === false) return;
    const level = slide.level ?? 1;
    const entry: TocItem = { title: slide.title, slideIndex: index };
    if (level > 1) entry.level = level as 2 | 3 | 4;

    if (level <= 1) {
      currentSection = entry;
      roots.push(entry);
    } else if (currentSection) {
      if (!currentSection.sublist) currentSection.sublist = [];
      currentSection.sublist.push(entry);
    } else {
      // No section yet to nest under - stays a top-level entry.
      roots.push(entry);
    }
  });

  return roots;
};

/**
 * Resolves the final TOC tree for a story: a manual `tableOfContents` is used as-is, except any
 * `{ autoToc: true }` sentinel (at any depth) is spliced out and replaced with the auto-generated
 * section/slide tree built from `buildAutoToc`. With no manual `tableOfContents` at all, the auto
 * tree is used directly.
 */
export const resolveTableOfContents = (config: StoryConfig): TocItem[] => {
  const auto = buildAutoToc(config.slides);
  if (!config.tableOfContents) return auto;

  const splice = (items: TocItem[]): TocItem[] =>
    items.flatMap((item): TocItem[] => {
      if (item.autoToc) return auto;
      if (item.sublist) return [{ ...item, sublist: splice(item.sublist) }];
      return [item];
    });

  return splice(config.tableOfContents);
};
