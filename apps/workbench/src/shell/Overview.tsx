import { useState } from 'react';
import { Button, Heading, ProgressBar, Text } from '@ds/components';
import { ENTRIES, entryKey } from '../lib/catalog';
import type { Entry } from '../lib/catalog';
import { clearReviews, useReviews } from '../lib/review';

/** Where the code behind an entry lives — so pasted notes point Claude at the right files */
const whereIs = (e: Entry) =>
  e.kind === 'component'
    ? `packages/components/src/${e.id}`
    : e.kind === 'page'
      ? `apps/workbench/src/specimens/pages, ${e.label} page`
      : `apps/workbench/src/specimens, ${e.label} sheet`;

/** Start screen: how far the review has got, and everything flagged. */
export function Overview({ onGo }: { onGo: (e: Entry) => void }) {
  const reviews = useReviews();
  const [copied, setCopied] = useState(false);
  const reviewable = ENTRIES;
  const noteOf = (e: Entry) => reviews[entryKey(e)]?.note?.trim() ?? '';
  const good = reviewable.filter((e) => reviews[entryKey(e)]?.status === 'good');
  const issues = reviewable.filter((e) => reviews[entryKey(e)]?.status === 'issue');
  // Notes written on something marked good (or not marked yet) still count
  const otherNotes = reviewable.filter((e) => reviews[entryKey(e)]?.status !== 'issue' && noteOf(e));
  const next = reviewable.find((e) => !reviews[entryKey(e)]?.status) ?? reviewable[0]!;
  const reviewed = good.length + issues.length;

  const copyNotes = async () => {
    const line = (e: Entry) => `- ${e.label} (${whereIs(e)})${noteOf(e) ? `: ${noteOf(e)}` : ''}`;
    const text = [
      `Workbench review — ${issues.length} ${issues.length === 1 ? 'needs' : 'need'} work, ${good.length} ${good.length === 1 ? 'looks' : 'look'} good, ${reviewable.length - reviewed} not reviewed.`,
      issues.length ? `Needs work:\n${issues.map(line).join('\n')}` : 'Nothing flagged as needing work.',
      otherNotes.length ? `Other notes:\n${otherNotes.map(line).join('\n')}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt('Copy your notes:', text);
    }
  };

  return (
    <div className="wb-overview">
      <section className="wb-overview__hero">
        <Heading as="h1" size="2xl">
          {reviewed === 0 ? 'Ready to review' : reviewed === reviewable.length ? 'Everything reviewed' : 'Review in progress'}
        </Heading>
        <Text muted className="wb-overview__lede">
          Every component, foundation and store page, shown at real phone, tablet and desktop widths in light and dark.
          Mark each one as it looks right — or note what’s off.
        </Text>
        <ProgressBar
          value={reviewed}
          max={reviewable.length}
          label={`${reviewed} of ${reviewable.length} reviewed`}
          variant={reviewed === reviewable.length ? 'success' : 'default'}
        />
        <div className="wb-overview__stats">
          <span>
            <strong>{good.length}</strong> {good.length === 1 ? 'looks' : 'look'} good
          </span>
          <span>
            <strong>{issues.length}</strong> {issues.length === 1 ? 'needs' : 'need'} work
          </span>
          <span>
            <strong>{reviewable.length - reviewed}</strong> not reviewed
          </span>
        </div>
        <div className="wb-overview__actions">
          <Button onClick={() => onGo(next)}>{reviewed ? `Continue with ${next.label}` : 'Start reviewing'}</Button>
          <Button variant="secondary" onClick={() => void copyNotes()} disabled={!issues.length && !otherNotes.length}>
            {copied ? 'Copied' : 'Copy notes for Claude'}
          </Button>
        </div>
        {/* Checking progress on a phone shows the phone's own (empty) list — say so before it looks like lost work */}
        <Text size="sm" muted>
          Verdicts and notes are saved in this browser only — another browser, or your phone, keeps its own list.
        </Text>
      </section>

      {issues.length > 0 && (
        <section className="wb-overview__section">
          <Heading as="h2" size="xl">
            Needs work
          </Heading>
          <ul className="wb-overview__issues">
            {issues.map((e) => (
              <li key={entryKey(e)}>
                <button type="button" className="wb-overview__issue" onClick={() => onGo(e)}>
                  <span className="wb-dot wb-dot--issue" aria-hidden="true" />
                  <span className="wb-overview__issue-body">
                    <strong>{e.label}</strong>
                    <span>{reviews[entryKey(e)]?.note || 'No note yet'}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {otherNotes.length > 0 && (
        <section className="wb-overview__section">
          <Heading as="h2" size="xl">
            Other notes
          </Heading>
          <ul className="wb-overview__issues">
            {otherNotes.map((e) => (
              <li key={entryKey(e)}>
                <button type="button" className="wb-overview__issue" onClick={() => onGo(e)}>
                  <span
                    className={['wb-dot', reviews[entryKey(e)]?.status === 'good' && 'wb-dot--good'].filter(Boolean).join(' ')}
                    aria-hidden="true"
                  />
                  <span className="wb-overview__issue-body">
                    <strong>{e.label}</strong>
                    <span>{noteOf(e)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="wb-overview__section">
        <Heading as="h2" size="xl">
          How to test
        </Heading>
        <ul className="wb-overview__tips">
          <li>
            <strong>Look at it on a phone first.</strong> Most layout bugs only show at 375px. Use <em>All</em> to
            compare phone, tablet and desktop side by side — scrolling one frame scrolls the others.
          </li>
          <li>
            <strong>Flip to Dark, or Both.</strong> Check text stays readable and edges stay visible.
          </li>
          <li>
            <strong>Break it on purpose.</strong> <em>Long text</em> doubles every label; <em>Right-to-left</em> mirrors the
            layout; <em>Outlines</em> shows every box so misalignment is obvious; <em>Freeze</em> stops animations.
            Modes stay on until you turn them off — <em>Reset</em> appears while one is on.
          </li>
          <li>
            <strong>Use it.</strong> Frames are live — click, type, and press Tab to walk through with the keyboard.
          </li>
          <li>
            <strong>Check touch on a real phone.</strong> Frames match a phone’s width, not its finger — larger tap
            areas only switch on with a touch screen. Open this page on your phone (same Wi-Fi, your computer’s
            address, port 4321) for a final pass.
          </li>
          <li>
            <strong>Watch the toolbar.</strong> A red dot there means a component threw an error, or the accessibility
            check found something.
          </li>
          <li>
            <strong>Keys:</strong> <kbd>G</kbd> looks good and next, <kbd>N</kbd> needs work, <kbd>J</kbd>/<kbd>K</kbd>{' '}
            next/previous, <kbd>T</kbd> theme, <kbd>W</kbd> width, <kbd>R</kbd> replay.
          </li>
        </ul>
        <div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (window.confirm('Clear every verdict and note?')) clearReviews();
            }}
          >
            Reset review
          </Button>
        </div>
      </section>
    </div>
  );
}
