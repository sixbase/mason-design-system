import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Drawer, Menu, SkipLink } from '@ds/components';
import { describeModule, ENTRIES, entryKey, findEntry, loadStoryModule, storyLabel, storyNames } from '../lib/catalog';
import type { Entry } from '../lib/catalog';
import { getReview, setReview } from '../lib/review';
import { frameIds, useSettings } from '../lib/settings';
import type { Settings } from '../lib/settings';
import { Overview } from './Overview';
import { ReviewBar } from './ReviewBar';
import { parseRoute, useRoute } from './route';
import { Sidebar } from './Sidebar';
import { Stage } from './Stage';
import type { StageEvents } from './Stage';
import { Toolbar } from './Toolbar';
import type { Findings } from './Toolbar';

const STATIC_DESCRIPTIONS: Record<string, string> = {
  'foundation/colors': 'Every color token, with live contrast measured in the frame’s theme.',
  'foundation/type': 'Heading and Text components, then every font-size token.',
  'foundation/space': 'Spacing, radius and elevation tokens.',
  'foundation/motion': 'Easing and duration tokens, plus every motion pattern — press Play and Replay.',
  'foundation/control-sizes': 'Buttons, fields, selectors and toggles at each size, on shared guide lines.',
  'foundation/status-colors': 'Success, warning, error and info across every component that shows them.',
  'foundation/form-states': 'Every form field in empty, filled, hint, error and disabled states.',
};

/** A frame that hasn't answered the accessibility check by then is reported, not waited on forever */
const AXE_TIMEOUT = 20000;
/** Never reused in a session: frames live across views and ignore a run number they've answered */
let axeRuns = 0;

const cycle = <T,>(list: readonly T[], value: T): T => list[(list.indexOf(value) + 1) % list.length]!;

/** The entry in the address bar right now — fresher than React state when keys are pressed quickly */
const liveEntry = () => {
  const r = parseRoute(window.location.hash);
  return r.kind === 'overview' ? undefined : findEntry(r.kind, r.id);
};

function useStoryList(entry: Entry | undefined) {
  const [state, setState] = useState<{ id: string; names: string[]; labels: string[]; description?: string }>({
    id: '',
    names: [],
    labels: [],
  });
  useEffect(() => {
    if (!entry || entry.kind !== 'component') return undefined;
    let alive = true;
    void loadStoryModule(entry.id)?.then((mod) => {
      const names = storyNames(mod);
      if (alive) setState({ id: entry.id, names, labels: names.map((n) => storyLabel(mod, n)), description: describeModule(mod) });
    });
    return () => {
      alive = false;
    };
  }, [entry]);
  return entry && state.id === entry.id
    ? { ...state, loaded: true }
    : { id: '', names: [] as string[], labels: [] as string[], description: undefined, loaded: false };
}

export function App() {
  const [route, go] = useRoute();
  const [settings, setSettings] = useSettings();
  const [reloadKey, setReloadKey] = useState(0);
  const [findings, setFindings] = useState<Findings>({ errors: [], axe: null });
  const [menuOpen, setMenuOpen] = useState(false);
  const noteRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  const entry = route.kind === 'overview' ? undefined : findEntry(route.kind, route.id);
  // An old bookmark to something renamed or removed: show the Overview, and
  // say so in the address bar (so the sidebar highlights it) without a Back step
  const unknown = route.kind !== 'overview' && !entry;
  useEffect(() => {
    if (unknown) window.location.replace('#/overview');
  }, [unknown]);
  const stories = useStoryList(entry);
  // The frame resolves '' to the first story itself, so frames never wait
  // for this list — and an overlay entry never flashes every state at once
  // (all its modals open together) while the list loads.
  const story =
    route.state === 'all'
      ? 'all'
      : route.state && (!stories.loaded || stories.names.includes(route.state))
        ? route.state
        : entry?.solo
          ? ''
          : 'all';
  const activeState = story === '' ? stories.names[0] : story;

  // Findings belong to what's on screen: new content, theme, width or test
  // mode → start clean (frames re-report errors for the new view)
  const viewKey = [route.kind, route.id, story, settings.theme, settings.width, settings.motion, settings.outlines, settings.stretch, settings.rtl, reloadKey].join('|');
  useEffect(() => setFindings({ errors: [], axe: null }), [viewKey]);

  const axeRun = findings.axe?.run ?? 0;
  useEffect(() => {
    if (!axeRun) return undefined;
    const t = window.setTimeout(() => {
      setFindings((f) => {
        if (f.axe?.run !== axeRun) return f;
        const failed = { ...f.axe.failed };
        for (const fid of f.axe.expected) {
          if (!(fid in f.axe.results) && !(fid in failed)) failed[fid] = 'This frame didn’t answer. Press Replay, then run the check again.';
        }
        return { ...f, axe: { ...f.axe, failed } };
      });
    }, AXE_TIMEOUT);
    return () => window.clearTimeout(t);
  }, [axeRun]);

  const goEntry = useCallback(
    (e: Entry | null) => {
      setMenuOpen(false);
      go(e ? { kind: e.kind, id: e.id } : { kind: 'overview', id: '' });
    },
    [go],
  );
  const step = useCallback(
    (delta: number) => {
      const current = liveEntry();
      const index = current ? ENTRIES.indexOf(current) : -1;
      // From the overview, J starts at the top and K at the bottom
      const next = ENTRIES[index < 0 ? (delta > 0 ? 0 : ENTRIES.length - 1) : (index + delta + ENTRIES.length) % ENTRIES.length];
      if (next) goEntry(next);
    },
    [goEntry],
  );

  const onSettings = useCallback((patch: Partial<Settings>) => setSettings(patch), [setSettings]);

  const onKey = useCallback(
    (key: string) => {
      const current = liveEntry();
      if (key === 'j' || key === ']') step(1);
      else if (key === 'k' || key === '[') step(-1);
      else if (key === 't') setSettings((s) => ({ theme: cycle(['light', 'dark', 'both'] as const, s.theme) }));
      else if (key === 'w') setSettings((s) => ({ width: cycle(['phone', 'tablet', 'desktop', 'all'] as const, s.width) }));
      else if (key === 'r') setReloadKey((k) => k + 1);
      else if (current && key === 'g') {
        setReview(entryKey(current), { status: 'good' });
        step(1);
      } else if (current && key === 'n') {
        setReview(entryKey(current), { status: 'issue' });
        window.setTimeout(() => noteRef.current?.focus(), 0);
      }
    },
    [step, setSettings],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.defaultPrevented || e.isComposing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (t?.closest('[role="dialog"], [role="menu"], [role="listbox"]')) return;
      if (/^[jkgntwr[\]]$/i.test(e.key)) {
        // No stray letter: N focuses the note field, which must not receive the "n"
        e.preventDefault();
        onKey(e.key.toLowerCase());
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKey]);

  const events = useMemo<StageEvents>(
    () => ({
      // The same error in several frames is one line that lists where it happened
      onErrors: (fid, message) =>
        setFindings((f) => {
          const same = f.errors.find((e) => e.message === message);
          if (!same) return { ...f, errors: [...f.errors, { fids: [fid], message }] };
          if (same.fids.includes(fid)) return f;
          return { ...f, errors: f.errors.map((e) => (e === same ? { ...e, fids: [...e.fids, fid] } : e)) };
        }),
      onAxe: (msg) =>
        setFindings((f) => {
          // Only answers to the check in progress
          if (!f.axe || f.axe.run !== msg.run || !f.axe.expected.includes(msg.fid)) return f;
          return msg.failed
            ? { ...f, axe: { ...f.axe, failed: { ...f.axe.failed, [msg.fid]: msg.failed } } }
            : { ...f, axe: { ...f.axe, results: { ...f.axe.results, [msg.fid]: msg.issues } } };
        }),
      onKey,
      onNavigate: (kind, id) => {
        const target = findEntry(kind, id);
        if (target) goEntry(target);
      },
    }),
    [onKey, goEntry],
  );

  const onCheck = useCallback(() => {
    setFindings((f) => ({
      ...f,
      axe: { run: ++axeRuns, expected: frameIds(settings), results: {}, failed: {} },
    }));
  }, [settings]);

  const sidebar = <Sidebar route={route} onGo={goEntry} />;
  const menuButton = (
    <Button size="sm" variant="ghost" iconOnly aria-label="Open component list" onClick={() => setMenuOpen(true)}>
      <Menu size="sm" />
    </Button>
  );
  const drawer = (
    <Drawer open={menuOpen} onOpenChange={setMenuOpen} side="left" title="Components" size="sm">
      {sidebar}
    </Drawer>
  );
  // The shell routes on the hash, so the skip link moves focus by hand
  const skipLink = (
    <SkipLink
      href="#wb-main"
      onClick={(e) => {
        e.preventDefault();
        mainRef.current?.focus();
      }}
    >
      {entry ? 'Skip to the preview controls' : 'Skip to the overview'}
    </SkipLink>
  );

  if (!entry) {
    return (
      <div className="wb-app">
        {skipLink}
        <aside className="wb-app__sidebar">{sidebar}</aside>
        <main ref={mainRef} id="wb-main" tabIndex={-1} className="wb-main wb-main--overview">
          <div className="wb-mobilebar">{menuButton}</div>
          <Overview onGo={goEntry} />
        </main>
        {drawer}
      </div>
    );
  }

  const description =
    entry.kind === 'component' ? stories.description : entry.kind === 'page' ? 'A full store page, built only from components.' : STATIC_DESCRIPTIONS[entryKey(entry)];

  return (
    <div className="wb-app">
      {skipLink}
      <aside className="wb-app__sidebar">{sidebar}</aside>
      <main ref={mainRef} id="wb-main" tabIndex={-1} className="wb-main">
        <Toolbar
          title={entry.label}
          menuButton={menuButton}
          settings={settings}
          onSettings={onSettings}
          onReplay={() => setReloadKey((k) => k + 1)}
          onCheck={onCheck}
          onAddToNotes={(text) => {
            const key = entryKey(entry);
            const note = getReview(key).note?.trim();
            if (note?.includes(text)) return;
            setReview(key, { status: 'issue', note: note ? `${note}; ${text}` : text });
          }}
          findings={findings}
        />

        <div className="wb-subbar">
          {description && <p className="wb-subbar__description">{description}</p>}
          {entry.kind === 'component' && stories.names.length > 1 && (
            <div className="wb-states" role="group" aria-label="States">
              <Button
                size="sm"
                variant={story === 'all' ? 'secondary' : 'ghost'}
                aria-pressed={story === 'all'}
                onClick={() => go({ kind: entry.kind, id: entry.id, state: 'all' })}
              >
                All states
              </Button>
              {stories.names.map((name, i) => (
                <Button
                  key={name}
                  size="sm"
                  variant={activeState === name ? 'secondary' : 'ghost'}
                  aria-pressed={activeState === name}
                  onClick={() => go({ kind: entry.kind, id: entry.id, state: name })}
                >
                  {stories.labels[i]}
                </Button>
              ))}
            </div>
          )}
        </div>

        <Stage route={route} story={story} settings={settings} reloadKey={reloadKey} axeRun={axeRun} events={events} />

        <ReviewBar ref={noteRef} reviewKey={entryKey(entry)} label={entry.label} onPrev={() => step(-1)} onNext={() => step(1)} />
      </main>
      {drawer}
    </div>
  );
}
