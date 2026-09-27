import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SegmentedControl,
  SegmentedControlItem,
  Tooltip,
} from '@ds/components';
import type { AxeIssue } from '../lib/messages';
import { frameName, modesChanged, NORMAL_MODES } from '../lib/settings';
import type { Settings, ThemeSetting, WidthSetting } from '../lib/settings';

function Toggle({
  on,
  label,
  hint,
  onChange,
}: {
  on: boolean;
  label: string;
  hint: string;
  onChange: (on: boolean) => void;
}) {
  return (
    <Tooltip content={hint}>
      <Button size="sm" variant={on ? 'secondary' : 'ghost'} aria-pressed={on} onClick={() => onChange(!on)}>
        {label}
      </Button>
    </Tooltip>
  );
}

/** One accessibility check across every frame on the stage */
export interface AxeState {
  run: number;
  /** Frames asked (ids like "phone-dark") */
  expected: string[];
  results: Record<string, AxeIssue[]>;
  /** Frames where the check itself failed or never answered */
  failed: Record<string, string>;
}

export interface Findings {
  errors: Array<{ fids: string[]; message: string }>;
  axe: AxeState | null;
}

export const axeChecking = (axe: AxeState | null) =>
  Boolean(axe && axe.expected.some((fid) => !(fid in axe.results) && !(fid in axe.failed)));

function FindingsButton({ label, tone, children }: { label: string; tone: 'bad' | 'ok'; children: ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost">
          <span className={`wb-dot wb-dot--${tone === 'bad' ? 'issue' : 'good'}`} aria-hidden="true" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" showClose>
        <div className="wb-findings__list">{children}</div>
      </PopoverContent>
    </Popover>
  );
}

/** The automated check's rule names in plain words — the common ones; others show the check's own wording */
const PLAIN_RULES: Record<string, string> = {
  'color-contrast': 'Text is too faint against its background',
  'button-name': 'A button has no name, so a screen reader just says “button”',
  'link-name': 'A link has no name, so a screen reader can’t say where it goes',
  'image-alt': 'An image has no description for people who can’t see it',
  label: 'A form field has no label',
  'select-name': 'A dropdown has no label',
  'nested-interactive': 'Something clickable sits inside something else clickable',
  'scrollable-region-focusable': 'A scrolling area can’t be reached with the keyboard',
  'heading-order': 'Headings skip a level',
  'aria-hidden-focus': 'Something hidden from screen readers can still be reached with Tab',
};

const SEVERITY: Record<string, string> = {
  critical: 'Blocks some people',
  serious: 'Hard for some people',
  moderate: 'Awkward for some people',
  minor: 'Minor',
};

/**
 * "Check accessibility" and its results are the same button, so keyboard
 * focus never drops to the page when the check starts or finishes. The
 * first press opens the results panel and starts the check; it reads
 * "Checking…" until every frame has answered.
 */
function AxeCheck({
  axe,
  onCheck,
  onAddToNotes,
}: {
  axe: AxeState | null;
  onCheck: () => void;
  onAddToNotes: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [addedRun, setAddedRun] = useState(0);
  const checking = axeChecking(axe);

  // Same rule in several frames → one line, listing where it was found
  const byRule = new Map<string, AxeIssue & { frames: string[] }>();
  if (axe) {
    for (const fid of axe.expected) {
      for (const issue of axe.results[fid] ?? []) {
        const seen = byRule.get(issue.help);
        if (seen) {
          seen.frames.push(frameName(fid));
          seen.states = [...new Set([...seen.states, ...(issue.states ?? [])])];
        } else byRule.set(issue.help, { ...issue, states: issue.states ?? [], frames: [frameName(fid)] });
      }
    }
  }
  const issues = [...byRule.values()].sort((a, b) => b.count - a.count);
  const failed = axe ? Object.entries(axe.failed) : [];
  const done = axe && !checking;

  const label = !axe
    ? 'Check accessibility'
    : checking
      ? 'Checking…'
      : issues.length
        ? `${issues.length} accessibility ${issues.length === 1 ? 'issue' : 'issues'}`
        : failed.length
          ? 'Check incomplete'
          : 'Accessibility OK';

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next && !axe) onCheck();
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost">
          {done && <span className={`wb-dot wb-dot--${issues.length || failed.length ? 'issue' : 'good'}`} aria-hidden="true" />}
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" showClose>
        <div className="wb-findings__list" aria-live="polite">
          {!axe && <div className="wb-findings__item">Not checked yet.</div>}
          {checking && (
            <div className="wb-findings__item">
              Checking {axe!.expected.length} {axe!.expected.length === 1 ? 'frame' : 'frames'}…
            </div>
          )}
          {done &&
            issues.map((i) => (
              <div key={i.help} className="wb-findings__item">
                <strong>{PLAIN_RULES[i.id] ?? i.help}</strong>
                <span>
                  {SEVERITY[i.impact] ?? i.impact} · {i.count} {i.count === 1 ? 'place' : 'places'}
                  {i.states.length > 0 && ` in ${i.states.join(', ')}`} · {i.frames.join(', ')}
                </span>
              </div>
            ))}
          {done &&
            failed.map(([fid, why]) => (
              <div key={fid} className="wb-findings__item">
                <strong>Couldn’t check {frameName(fid)}</strong>
                <span>{why}</span>
              </div>
            ))}
          {done && !issues.length && !failed.length && (
            <div className="wb-findings__item">
              Automated checks passed in every frame. They catch about a third of problems — also try it with
              the keyboard (Tab, Enter, arrow keys).
            </div>
          )}
          {!checking && (
            <div className="wb-findings__actions">
              <Button size="sm" variant="secondary" onClick={onCheck}>
                {axe ? 'Run again' : 'Check now'}
              </Button>
              {/* Marks this entry "Needs work" with the findings in its note, ready for Copy notes */}
              {done && issues.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={addedRun === axe.run}
                  onClick={() => {
                    onAddToNotes(
                      `Accessibility check: ${issues
                        .map((i) => `${i.help}${i.states.length ? ` (in ${i.states.join(', ')})` : ''}`)
                        .join('; ')}`,
                    );
                    setAddedRun(axe.run);
                  }}
                >
                  {addedRun === axe.run ? 'Added to notes' : 'Add to notes'}
                </Button>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function Toolbar({
  title,
  menuButton,
  settings,
  onSettings,
  onReplay,
  onCheck,
  onAddToNotes,
  findings,
}: {
  title: string;
  /** Opens the component list — shown only when the sidebar is hidden */
  menuButton?: ReactNode;
  settings: Settings;
  onSettings: (patch: Partial<Settings>) => void;
  onReplay: () => void;
  onCheck: () => void;
  onAddToNotes: (text: string) => void;
  findings: Findings;
}) {
  const modesRef = useRef<HTMLDivElement>(null);
  return (
    <header className="wb-toolbar">
      <div className="wb-toolbar__lead">
        {menuButton && <div className="wb-toolbar__menu">{menuButton}</div>}
        <h1 className="wb-toolbar__title">{title}</h1>
      </div>

      <div className="wb-toolbar__controls">
        <SegmentedControl
          size="sm"
          aria-label="Theme"
          value={settings.theme}
          onValueChange={(v) => onSettings({ theme: v as ThemeSetting })}
        >
          <SegmentedControlItem value="light">Light</SegmentedControlItem>
          <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
          <SegmentedControlItem value="both">Both</SegmentedControlItem>
        </SegmentedControl>

        <SegmentedControl
          size="sm"
          aria-label="Screen size"
          value={settings.width}
          onValueChange={(v) => onSettings({ width: v as WidthSetting })}
        >
          <SegmentedControlItem value="phone">Phone</SegmentedControlItem>
          <SegmentedControlItem value="tablet">Tablet</SegmentedControlItem>
          <SegmentedControlItem value="desktop">Desktop</SegmentedControlItem>
          <SegmentedControlItem value="all">All</SegmentedControlItem>
        </SegmentedControl>

        {/* Test modes and actions always get a row of their own, so the
            frames don't jump up and down as the title's length changes (J/K)
            or Reset comes and goes */}
        <div className="wb-toolbar__row">
          {/* Every test mode reads the same way: highlighted = on = not how it normally looks */}
          <div
            ref={modesRef}
            className={['wb-toolbar__toggles', modesChanged(settings) && 'wb-toolbar__toggles--on'].filter(Boolean).join(' ')}
            role="group"
            aria-label="Test modes"
          >
            <Toggle
              on={!settings.motion}
              label="Freeze"
              hint="Freeze animations — what someone with “reduce motion” turned on sees."
              onChange={(off) => onSettings({ motion: !off })}
            />
            <Toggle
              on={settings.outlines}
              label="Outlines"
              hint="Draw a line around every element to check alignment and spacing."
              onChange={(outlines) => onSettings({ outlines })}
            />
            <Toggle
              on={settings.stretch}
              label="Long text"
              hint="Double every piece of text to see how components wrap and overflow."
              onChange={(stretch) => onSettings({ stretch })}
            />
            <Toggle
              on={settings.rtl}
              label="Right-to-left"
              hint="Mirror the layout, as it would be for Arabic or Hebrew."
              onChange={(rtl) => onSettings({ rtl })}
            />
            {/* Modes are remembered between visits — easy to forget one is on */}
            {modesChanged(settings) && (
              <Tooltip content="Turn every test mode off and see components as they normally look.">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onSettings(NORMAL_MODES);
                    // This button disappears once everything is off — keep keyboard focus in the group
                    modesRef.current?.querySelector('button')?.focus();
                  }}
                >
                  Reset
                </Button>
              </Tooltip>
            )}
          </div>

          <div className="wb-toolbar__actions">
            <Tooltip content="Reload the frames to replay entrance animations (R)">
              <Button size="sm" variant="ghost" onClick={onReplay}>
                Replay
              </Button>
            </Tooltip>

            <AxeCheck axe={findings.axe} onCheck={onCheck} onAddToNotes={onAddToNotes} />

            {findings.errors.length > 0 && (
              <FindingsButton tone="bad" label={`${findings.errors.length} ${findings.errors.length === 1 ? 'error' : 'errors'}`}>
                {findings.errors.map((e, i) => (
                  <div key={i} className="wb-findings__item">
                    <strong>{e.message}</strong>
                    <span>{e.fids.map(frameName).join(', ')}</span>
                  </div>
                ))}
              </FindingsButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
