/**
 * Everything the workbench can show, in sidebar order.
 *
 * Components are discovered from their stories — the stories ARE
 * the specimens, so a new component with a story appears here with no
 * extra work. Any story folder missing from GROUPS still shows up, under
 * "Other", so nothing can silently go untested.
 */
import type { ComponentType } from 'react';

export type EntryKind = 'component' | 'foundation' | 'page';

export interface Entry {
  kind: EntryKind;
  id: string;
  label: string;
  group: string;
  /** Show one state at a time by default (overlays that open on mount would collide) */
  solo?: boolean;
}

type StoryModule = Record<string, unknown> & { default: { parameters?: Record<string, unknown> } };

const storyLoaders = import.meta.glob<StoryModule>('../../../../packages/components/src/*/*.stories.tsx');
// Module namespaces list exports alphabetically; the source text keeps the
// order the stories were written in (Primary before Disabled, etc.).
const storySources = import.meta.glob<string>('../../../../packages/components/src/*/*.stories.tsx', {
  query: '?raw',
  import: 'default',
});

/** folder name → story module loader (with its exports in file order) */
const loaderById = new Map<string, () => Promise<StoryModule>>();
for (const [path, load] of Object.entries(storyLoaders)) {
  const folder = path.split('/').at(-2);
  const source = storySources[path];
  if (!folder || !source) continue;
  loaderById.set(folder, () =>
    Promise.all([load(), source()]).then(([mod, text]) => {
      const order = [...text.matchAll(/^export const (\w+)/gm)].map((m) => m[1]!);
      return Object.assign(Object.create(null) as StoryModule, mod, { __namedExportsOrder: order });
    }),
  );
}

const cache = new Map<string, Promise<StoryModule>>();
export function loadStoryModule(id: string): Promise<StoryModule> | null {
  const load = loaderById.get(id);
  if (!load) return null;
  if (!cache.has(id)) cache.set(id, load());
  return cache.get(id)!;
}

const GROUPS: Array<[string, string[]]> = [
  ['Basics', ['typography', 'button', 'badge', 'tag', 'avatar', 'icon', 'divider', 'spinner', 'skeleton']],
  [
    'Forms',
    [
      'input',
      'textarea',
      'select',
      'checkbox',
      'radio-group',
      'switch',
      'slider',
      'segmented-control',
      'quantity-selector',
      'color-picker',
      'color-swatch',
      'variant-selector',
    ],
  ],
  ['Layout', ['container', 'grid', 'layout-grid', 'card', 'accordion', 'tabs', 'table']],
  ['Overlays', ['modal', 'drawer', 'popover', 'tooltip', 'dropdown-menu', 'toast', 'cookie-consent']],
  ['Feedback', ['alert', 'empty-state', 'progress-bar', 'stock-indicator', 'countdown']],
  [
    'Commerce',
    [
      'product-card',
      'price-display',
      'star-rating',
      'add-to-cart-button',
      'cart-line-item',
      'cart-drawer',
      'collection-filters',
      'image-gallery',
      'carousel',
      'feature-block',
      'highlights',
      'predictive-search',
    ],
  ],
  ['Navigation', ['header', 'footer', 'announcement-bar', 'breadcrumb', 'pagination', 'stepper', 'skip-link']],
];

const SOLO = new Set(['modal', 'drawer', 'cart-drawer', 'cookie-consent', 'toast']);

const SMALL_WORDS = new Set(['to', 'and', 'of', 'a']);
function labelFor(id: string): string {
  return id
    .split('-')
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w[0]!.toUpperCase() + w.slice(1)))
    .join(' ');
}

const FOUNDATIONS: Entry[] = [
  { kind: 'foundation', id: 'colors', label: 'Colors', group: 'Foundations' },
  { kind: 'foundation', id: 'type', label: 'Type scale', group: 'Foundations' },
  { kind: 'foundation', id: 'space', label: 'Space, radius & shadow', group: 'Foundations' },
  { kind: 'foundation', id: 'motion', label: 'Motion', group: 'Foundations' },
  { kind: 'foundation', id: 'control-sizes', label: 'Control sizes line-up', group: 'Consistency' },
  { kind: 'foundation', id: 'status-colors', label: 'Status colors line-up', group: 'Consistency' },
  { kind: 'foundation', id: 'form-states', label: 'Form states line-up', group: 'Consistency' },
];

const PAGES: Entry[] = [
  ['homepage', 'Home'],
  ['product-detail', 'Product'],
  ['collection', 'Collection'],
  ['cart', 'Cart'],
  ['search', 'Search'],
  ['sale', 'Sale'],
  ['account', 'Account'],
  ['terms', 'Terms'],
].map(([id, label]) => ({ kind: 'page', id: id!, label: label!, group: 'Store pages' }));

function buildComponents(): Entry[] {
  const listed = new Set<string>();
  const out: Entry[] = [];
  for (const [group, ids] of GROUPS) {
    for (const id of ids) {
      if (!loaderById.has(id)) continue;
      listed.add(id);
      out.push({ kind: 'component', id, label: labelFor(id), group, solo: SOLO.has(id) });
    }
  }
  for (const id of [...loaderById.keys()].sort()) {
    if (!listed.has(id)) out.push({ kind: 'component', id, label: labelFor(id), group: 'Other' });
  }
  return out;
}

export const ENTRIES: Entry[] = [...FOUNDATIONS, ...buildComponents(), ...PAGES];

export const entryKey = (e: Pick<Entry, 'kind' | 'id'>) => `${e.kind}/${e.id}`;

export function findEntry(kind: string, id: string): Entry | undefined {
  return ENTRIES.find((e) => e.kind === kind && e.id === id);
}

/** "WithLeadingIcon" → "With leading icon" */
export function humanize(exportName: string): string {
  const spaced = exportName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => PLAIN_WORDS[w] ?? w)
    .join(' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Code shorthand in story names → plain words ("SpacingSm" → "Spacing small") */
const PLAIN_WORDS: Record<string, string> = {
  xs: 'extra small',
  sm: 'small',
  md: 'medium',
  lg: 'large',
  xl: 'extra large',
  ssr: 'plain-link',
};

/** What a state is called — its story's own `name` if it has one, so the state buttons and the frame agree */
export function storyLabel(mod: StoryModule, exportName: string): string {
  const name = (mod[exportName] as { name?: unknown } | undefined)?.name;
  return typeof name === 'string' && name ? name : humanize(exportName);
}

/** Named story exports of a module, in file order */
export function storyNames(mod: StoryModule): string[] {
  const order = (mod as { __namedExportsOrder?: string[] }).__namedExportsOrder;
  const names = order ?? Object.keys(mod);
  return names.filter((k) => k !== 'default' && k !== '__namedExportsOrder' && typeof mod[k] === 'object');
}

export function describeModule(mod: StoryModule): string | undefined {
  const docs = mod.default.parameters?.docs as { description?: { component?: string } } | undefined;
  return docs?.description?.component;
}

export type Specimen = ComponentType;
