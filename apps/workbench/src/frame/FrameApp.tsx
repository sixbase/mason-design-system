import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { composeStories } from '@storybook/react';
import { loadStoryModule, storyLabel, storyNames } from '../lib/catalog';
import { frameHash as frameHashOf, parseFrameHash } from '../lib/messages';
import type { FrameParams } from '../lib/messages';
import { SPECIMENS } from '../specimens';
import { applyEnvironment, currentView, LOADING_ATTR, post, reportError, setStretch, whenSettled } from './environment';

type StoryModule = NonNullable<Awaited<ReturnType<typeof loadStoryModule>>>;
type ComposedStory = ((props?: Record<string, unknown>) => JSX.Element) & {
  storyName?: string;
  parameters?: { layout?: string };
};

// ─── Error boundary: a broken story shows up as a red card, not a blank frame

class StoryBoundary extends Component<{ name: string; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(`${this.props.name}: ${error.message}${info.componentStack ? '' : ''}`);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="wb-crash" role="alert">
          <strong>This state crashed.</strong>
          <span>{this.state.error.message}</span>
        </div>
      );
    }
    return this.props.children;
  }
}

const Loading = () => (
  <p className="wb-empty" {...{ [LOADING_ATTR]: '' }}>
    Loading…
  </p>
);

// ─── Component: every story, stacked ────────────────────────

function useStoryModule(id: string) {
  const [state, setState] = useState<{ id: string; mod: StoryModule | null; missing: boolean }>({
    id: '',
    mod: null,
    missing: false,
  });
  useEffect(() => {
    let alive = true;
    const loading = loadStoryModule(id);
    if (!loading) {
      setState({ id, mod: null, missing: true });
      return undefined;
    }
    loading.then(
      (mod) => alive && setState({ id, mod, missing: false }),
      (err: unknown) => {
        reportError(`Could not load ${id}: ${String(err)}`);
        if (alive) setState({ id, mod: null, missing: true });
      },
    );
    return () => {
      alive = false;
    };
  }, [id]);
  return state.id === id ? state : { id, mod: null, missing: false };
}

interface SheetStory {
  name: string;
  label: string;
  Story: ComposedStory;
}

/**
 * Composed once per story file, not on every visit: each composeStories()
 * call leaves Storybook bookkeeping behind, so recomposing on every J/K
 * made a long session's memory creep up.
 */
const composedByModule = new WeakMap<StoryModule, SheetStory[]>();
function composedStories(mod: StoryModule): SheetStory[] {
  const cached = composedByModule.get(mod);
  if (cached) return cached;
  // Only the CSF exports — our file-order list is metadata, not a story
  const csf = Object.fromEntries(Object.entries(mod).filter(([k]) => k !== '__namedExportsOrder'));
  const composed = composeStories(csf as Parameters<typeof composeStories>[0]) as Record<string, ComposedStory>;
  const list = storyNames(mod)
    .filter((name) => composed[name])
    .map((name) => ({ name, label: storyLabel(mod, name), Story: composed[name]! }));
  composedByModule.set(mod, list);
  return list;
}

function StorySheet({ id, story }: { id: string; story: string }) {
  const { mod, missing } = useStoryModule(id);

  const stories = useMemo(() => (mod ? composedStories(mod) : []), [mod]);

  if (missing) return <p className="wb-empty">No stories found for “{id}”.</p>;
  if (!mod) return <Loading />;

  // '' = the first story (the shell's default for overlays, which open on load)
  const shown = story === 'all' ? stories : story === '' ? stories.slice(0, 1) : stories.filter((s) => s.name === story);
  if (!shown.length) return <p className="wb-empty">No state called “{story}”.</p>;
  return (
    <>
      {shown.map(({ name, label, Story }) => {
        const layout = Story.parameters?.layout ?? 'padded';
        return (
          <section key={name} className="wb-story" data-wb-story={name}>
            <div className="wb-story__label">{label}</div>
            <div className={`wb-story__canvas wb-story__canvas--${layout}`}>
              <StoryBoundary name={label}>
                <Story />
              </StoryBoundary>
            </div>
          </section>
        );
      })}
    </>
  );
}

// ─── Frame root ─────────────────────────────────────────────

export function FrameApp() {
  const [params, setParams] = useState<FrameParams>(() => parseFrameHash(window.location.hash));

  useEffect(() => {
    const onHash = () => {
      // Only shell routes (#/kind/id?…). Anything else is an in-page jump
      // that slipped through — keep showing what we were showing.
      if (window.location.hash.startsWith('#/')) setParams(parseFrameHash(window.location.hash));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useLayoutEffect(() => {
    applyEnvironment(params);
    setStretch(params.stretch);
  }, [params]);

  // New content → start at the top of the frame
  const contentKey = `${params.kind}/${params.id}/${params.story}`;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [contentKey]);

  // Tell the shell once the real content (not "Loading…") is on screen
  const view = frameHashOf(params);
  useEffect(() => {
    let alive = true;
    void whenSettled().then(() => {
      if (alive && currentView() === view) post({ type: 'wb:rendered', fid: params.fid, view });
    });
    return () => {
      alive = false;
    };
  }, [view, params.fid]);

  let content: ReactNode;
  if (params.kind === 'component') {
    content = <StorySheet id={params.id} story={params.story} />;
  } else {
    const Specimen = SPECIMENS[`${params.kind}/${params.id}`];
    content = Specimen ? (
      <StoryBoundary name={params.id}>
        <Specimen />
      </StoryBoundary>
    ) : (
      <p className="wb-empty">Nothing here yet.</p>
    );
  }

  return (
    <div
      className={`wb-frame wb-frame--${params.kind}`}
      key={contentKey}
      // Skip links in component stories point at #main-content; store pages
      // bring their own <main id="main-content">.
      id={params.kind === 'component' ? 'main-content' : undefined}
      tabIndex={params.kind === 'component' ? -1 : undefined}
    >
      <Suspense fallback={<Loading />}>{content}</Suspense>
    </div>
  );
}
