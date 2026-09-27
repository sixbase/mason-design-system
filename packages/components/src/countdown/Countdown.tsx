import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { HTMLAttributes } from 'react';
import './Countdown.css';

// ─── Types ──────────────────────────────────────────────────

export interface CountdownLabels {
  /** Label under the days segment */
  days: string;
  /** Label under the hours segment */
  hours: string;
  /** Label under the minutes segment */
  minutes: string;
  /** Label under the seconds segment */
  seconds: string;
}

/** Digit size step. */
export type CountdownSize = 'sm' | 'md';

export interface CountdownProps extends HTMLAttributes<HTMLDivElement> {
  /** Target moment the countdown runs toward — Date or ISO 8601 string */
  target: Date | string;
  /** Called exactly once when the target moment passes */
  onComplete?: () => void;
  /** Custom unit labels. Merged over the defaults (days / hrs / mins / secs). */
  labels?: Partial<CountdownLabels>;
  /** Drop leading units whose value is zero (e.g. hide "00 days") */
  hideZeroUnits?: boolean;
  /** Size variant */
  size?: CountdownSize;
}

// ─── Time math ──────────────────────────────────────────────

interface TimeParts {
  /** Remaining milliseconds, clamped at 0 */
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const MS_PER_SECOND = 1000;
/** Longest delay setTimeout honours (2^31 − 1 ms ≈ 24.8 days); longer ones fire at once. */
const MAX_TIMEOUT = 2_147_483_647;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;

/**
 * Recomputes the remaining time from the wall clock. Called on every
 * tick instead of decrementing state so the display self-corrects for
 * setInterval drift and background-tab throttling.
 */
function getTimeParts(targetMs: number): TimeParts {
  // An unparseable target yields NaN, and Math.max(0, NaN) is NaN — which
  // would render "NaN" digits and never reach completion. Treat it as 0.
  const remaining = targetMs - Date.now();
  const total = Number.isFinite(remaining) ? Math.max(0, remaining) : 0;
  const totalSeconds = Math.floor(total / MS_PER_SECOND);

  return {
    total,
    days: Math.floor(totalSeconds / SECONDS_PER_DAY),
    hours: Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR),
    minutes: Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
    seconds: totalSeconds % SECONDS_PER_MINUTE,
  };
}

const pluralize = (count: number, unit: string) =>
  `${count} ${unit}${count === 1 ? '' : 's'}`;

/**
 * Human phrase for the screen-reader live region. Deliberately excludes
 * seconds so the string only changes once per minute — assistive tech
 * announces a live region only when its text content changes, so this
 * caps announcements at one per minute even though the visible digits
 * re-render every second.
 */
function formatAnnouncement(parts: TimeParts): string {
  if (parts.total <= 0) return 'Countdown complete';
  if (parts.days > 0) {
    return `${pluralize(parts.days, 'day')}, ${pluralize(parts.hours, 'hour')} remaining`;
  }
  if (parts.hours > 0) {
    return `${pluralize(parts.hours, 'hour')}, ${pluralize(parts.minutes, 'minute')} remaining`;
  }
  if (parts.minutes > 0) {
    return `${pluralize(parts.minutes, 'minute')} remaining`;
  }
  return 'Less than a minute remaining';
}

/**
 * Layout effect on the client (the first real values land before paint, so
 * the placeholder never flashes), plain effect on the server (where React
 * warns about useLayoutEffect and neither runs anyway).
 */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Shown until mounted — same width as two tabular digits, so no shift. */
const PLACEHOLDER_DIGITS = '--';

const defaultLabels: CountdownLabels = {
  days: 'days',
  hours: 'hrs',
  minutes: 'mins',
  seconds: 'secs',
};

// ─── Component ──────────────────────────────────────────────

/**
 * Countdown
 *
 * A sale / promotion timer that counts down to a target moment.
 * Digits render in the numeric (monospace) family with tabular
 * figures so the layout never jitters as values change.
 *
 * Accessibility: the per-second visual display is `aria-hidden`.
 * A single visually-hidden `aria-live="polite"` region carries a
 * human phrase ("2 days, 3 hours remaining") that changes at most
 * once per minute, so screen readers are not spammed every second.
 */
export const Countdown = forwardRef<HTMLDivElement, CountdownProps>(
  function Countdown(
    {
      target,
      onComplete,
      labels,
      hideZeroUnits = false,
      size = 'md',
      className,
      ...props
    },
    ref,
  ) {
    const targetMs = useMemo(
      () => (target instanceof Date ? target.getTime() : new Date(target).getTime()),
      [target],
    );

    // Remaining time depends on the wall clock, so it is only computed after
    // mount. Server HTML and the first client render both show placeholders —
    // computing it during render made SSR and hydration disagree (every
    // second boundary crossed between the two is a text mismatch).
    const [parts, setParts] = useState<TimeParts | null>(null);

    // Refs keep the interval effect keyed to targetMs only — a new
    // inline onComplete on every parent render must not reset the timer.
    const onCompleteRef = useRef(onComplete);
    // Declared before the timer effect so the ref is current when it runs.
    useIsomorphicLayoutEffect(() => {
      onCompleteRef.current = onComplete;
    });
    // The target that already fired onComplete. Keyed by target (not a
    // boolean reset on every effect run) so StrictMode's mount → unmount →
    // mount replay cannot fire it twice.
    const completedTargetRef = useRef<number | null>(null);

    // Own handle on the root (for the on-screen check), merged with the consumer's ref.
    const rootRef = useRef<HTMLDivElement | null>(null);
    const setRootRef = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    useIsomorphicLayoutEffect(() => {
      let intervalId: ReturnType<typeof setInterval> | undefined;
      let wakeId: ReturnType<typeof setTimeout> | undefined;
      let done = false;
      let onScreen = true;
      const validTarget = Number.isFinite(targetMs);

      const stop = () => {
        clearInterval(intervalId);
        clearTimeout(wakeId);
        intervalId = undefined;
        wakeId = undefined;
      };

      const tick = () => {
        // Drift correction: always recompute from Date.now(), never
        // decrement previous state.
        const next = getTimeParts(targetMs);
        setParts(next);

        if (next.total <= 0) {
          done = true;
          stop();
          // An invalid target renders zeros but never "completes" — a
          // typo'd date must not trigger completion side effects.
          if (validTarget && completedTargetRef.current !== targetMs) {
            completedTargetRef.current = targetMs;
            onCompleteRef.current?.();
          }
        }
        return next;
      };

      // Tick every second only while the digits can be seen. In a background
      // tab, or scrolled well out of view (a countdown in the announcement bar
      // on a long page), it used to keep re-rendering every second for the
      // life of the page — waking a phone's CPU for nothing. Paused, a single
      // timer stays armed for the target moment, so onComplete still fires
      // on time.
      const run = () => {
        stop();
        if (done) return;
        if (onScreen && document.visibilityState !== 'hidden') {
          intervalId = setInterval(tick, MS_PER_SECOND);
          return;
        }
        const remaining = targetMs - Date.now();
        if (remaining > 0) wakeId = setTimeout(resume, Math.min(remaining, MAX_TIMEOUT));
        else tick();
      };
      // Seen again: catch the digits up at once, then carry on.
      function resume() {
        if (!done && tick().total > 0) run();
      }

      // The first real values land before paint, visible or not (no placeholder flash).
      if (tick().total > 0) run();
      if (done) return undefined;

      const onVisibility = () => (document.visibilityState === 'hidden' ? run() : resume());
      document.addEventListener('visibilitychange', onVisibility);

      // A viewport of margin above and below: the countdown catches up
      // before it scrolls into view, so stale digits are never painted.
      const io =
        typeof IntersectionObserver === 'function' && rootRef.current
          ? new IntersectionObserver(
              (entries) => {
                const entry = entries[entries.length - 1];
                if (!entry || entry.isIntersecting === onScreen) return;
                onScreen = entry.isIntersecting;
                if (onScreen) resume();
                else run();
              },
              { rootMargin: '100% 0px' },
            )
          : null;
      if (io && rootRef.current) io.observe(rootRef.current);

      return () => {
        stop();
        document.removeEventListener('visibilitychange', onVisibility);
        io?.disconnect();
      };
    }, [targetMs]);

    const mergedLabels = { ...defaultLabels, ...labels };
    const units = [
      { key: 'days', value: parts?.days ?? 0, label: mergedLabels.days },
      { key: 'hours', value: parts?.hours ?? 0, label: mergedLabels.hours },
      { key: 'minutes', value: parts?.minutes ?? 0, label: mergedLabels.minutes },
      { key: 'seconds', value: parts?.seconds ?? 0, label: mergedLabels.seconds },
    ];

    let visibleUnits = units;
    // Before mount the values are unknown, so every unit is kept.
    if (hideZeroUnits && parts) {
      let start = 0;
      while (start < units.length - 1 && units[start]!.value === 0) start += 1;
      visibleUnits = units.slice(start);
    }

    const classes = [
      'ds-countdown',
      `ds-countdown--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={setRootRef} role="timer" className={classes} {...props}>
        {/* Visual digits tick every second — hidden from assistive tech */}
        <span className="ds-countdown__display" aria-hidden="true">
          {visibleUnits.map((unit, index) => (
            <Fragment key={unit.key}>
              {index > 0 && <span className="ds-countdown__separator">:</span>}
              <span className="ds-countdown__segment">
                <span className="ds-countdown__value">
                  {parts ? String(unit.value).padStart(2, '0') : PLACEHOLDER_DIGITS}
                </span>
                <span className="ds-countdown__label">{unit.label}</span>
              </span>
            </Fragment>
          ))}
        </span>

        {/* Single polite live region — changes at most once per minute */}
        <span
          className="ds-countdown__announcement"
          aria-live="polite"
          aria-atomic="true"
        >
          {parts ? formatAnnouncement(parts) : ''}
        </span>
      </div>
    );
  },
);

Countdown.displayName = 'Countdown';
