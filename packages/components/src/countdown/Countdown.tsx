import { Fragment, forwardRef, useEffect, useMemo, useRef, useState } from 'react';
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
  size?: 'sm' | 'md';
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
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;

/**
 * Recomputes the remaining time from the wall clock. Called on every
 * tick instead of decrementing state so the display self-corrects for
 * setInterval drift and background-tab throttling.
 */
function getTimeParts(targetMs: number): TimeParts {
  const total = Math.max(0, targetMs - Date.now());
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

    const [parts, setParts] = useState<TimeParts>(() => getTimeParts(targetMs));

    // Refs keep the interval effect keyed to targetMs only — a new
    // inline onComplete on every parent render must not reset the timer.
    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
      onCompleteRef.current = onComplete;
    });
    const completedRef = useRef(false);

    useEffect(() => {
      completedRef.current = false;
      let intervalId: ReturnType<typeof setInterval> | undefined;

      const tick = () => {
        // Drift correction: always recompute from Date.now(), never
        // decrement previous state.
        const next = getTimeParts(targetMs);
        setParts(next);

        if (next.total <= 0) {
          if (intervalId !== undefined) clearInterval(intervalId);
          if (!completedRef.current) {
            completedRef.current = true;
            onCompleteRef.current?.();
          }
        }
      };

      tick();
      if (!completedRef.current) {
        intervalId = setInterval(tick, MS_PER_SECOND);
      }

      return () => {
        if (intervalId !== undefined) clearInterval(intervalId);
      };
    }, [targetMs]);

    const mergedLabels = { ...defaultLabels, ...labels };
    const units = [
      { key: 'days', value: parts.days, label: mergedLabels.days },
      { key: 'hours', value: parts.hours, label: mergedLabels.hours },
      { key: 'minutes', value: parts.minutes, label: mergedLabels.minutes },
      { key: 'seconds', value: parts.seconds, label: mergedLabels.seconds },
    ];

    let visibleUnits = units;
    if (hideZeroUnits) {
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
      <div ref={ref} role="timer" className={classes} {...props}>
        {/* Visual digits tick every second — hidden from assistive tech */}
        <span className="ds-countdown__display" aria-hidden="true">
          {visibleUnits.map((unit, index) => (
            <Fragment key={unit.key}>
              {index > 0 && <span className="ds-countdown__separator">:</span>}
              <span className="ds-countdown__segment">
                <span className="ds-countdown__value">
                  {String(unit.value).padStart(2, '0')}
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
          {formatAnnouncement(parts)}
        </span>
      </div>
    );
  },
);

Countdown.displayName = 'Countdown';
