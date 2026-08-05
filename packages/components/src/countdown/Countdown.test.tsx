import { act, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Countdown } from './Countdown';

const NOW = new Date('2026-07-06T12:00:00.000Z');

/** Target `ms` in the future relative to the frozen clock. */
const targetIn = (ms: number) => new Date(NOW.getTime() + ms);

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

function getValues(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('.ds-countdown__value')).map(
    (el) => el.textContent ?? '',
  );
}

function getAnnouncement(container: HTMLElement): string {
  return container.querySelector('.ds-countdown__announcement')?.textContent ?? '';
}

describe('Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── Base rendering ─────────────────────────────────────

  it('renders a timer with all four segments', () => {
    const { container } = render(
      <Countdown target={targetIn(2 * DAY + 3 * HOUR + 4 * MINUTE + 5_000)} />,
    );

    expect(screen.getByRole('timer')).toBeInTheDocument();
    expect(getValues(container)).toEqual(['02', '03', '04', '05']);
  });

  it('renders default unit labels', () => {
    const { container } = render(<Countdown target={targetIn(DAY)} />);
    const labels = Array.from(
      container.querySelectorAll('.ds-countdown__label'),
    ).map((el) => el.textContent);
    expect(labels).toEqual(['days', 'hrs', 'mins', 'secs']);
  });

  it('renders custom unit labels merged over defaults', () => {
    const { container } = render(
      <Countdown target={targetIn(DAY)} labels={{ days: 'd', seconds: 's' }} />,
    );
    const labels = Array.from(
      container.querySelectorAll('.ds-countdown__label'),
    ).map((el) => el.textContent);
    expect(labels).toEqual(['d', 'hrs', 'mins', 's']);
  });

  it('accepts an ISO string target', () => {
    const { container } = render(
      <Countdown target={new Date(NOW.getTime() + HOUR).toISOString()} />,
    );
    expect(getValues(container)).toEqual(['00', '01', '00', '00']);
  });

  it('renders colon separators between segments', () => {
    const { container } = render(<Countdown target={targetIn(DAY)} />);
    const separators = container.querySelectorAll('.ds-countdown__separator');
    expect(separators).toHaveLength(3);
    expect(separators[0]?.textContent).toBe(':');
  });

  // ─── Ticking & drift correction ─────────────────────────

  it('ticks the seconds down each second', () => {
    const { container } = render(<Countdown target={targetIn(10_000)} />);
    expect(getValues(container)).toEqual(['00', '00', '00', '10']);

    act(() => {
      vi.advanceTimersByTime(3_000);
    });
    expect(getValues(container)).toEqual(['00', '00', '00', '07']);
  });

  it('recomputes from the wall clock instead of decrementing (drift correction)', () => {
    const { container } = render(<Countdown target={targetIn(2 * MINUTE)} />);
    expect(getValues(container)).toEqual(['00', '00', '02', '00']);

    // Simulate a throttled tab: the clock jumps 59s with NO interval
    // fires, then a single tick runs (advance covers the last 1s).
    act(() => {
      vi.setSystemTime(new Date(NOW.getTime() + 59_000));
      vi.advanceTimersByTime(1_000);
    });

    // One tick elapsed but the display reflects the full 60s jump.
    expect(getValues(container)).toEqual(['00', '00', '01', '00']);
  });

  // ─── Completion ─────────────────────────────────────────

  it('renders zeros and fires onComplete once when the target passes', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <Countdown target={targetIn(3_000)} onComplete={onComplete} />,
    );

    act(() => {
      vi.advanceTimersByTime(3_000);
    });
    expect(getValues(container)).toEqual(['00', '00', '00', '00']);
    expect(onComplete).toHaveBeenCalledTimes(1);

    // Further time must not re-fire or go negative.
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(getValues(container)).toEqual(['00', '00', '00', '00']);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('fires onComplete once when mounted with a past target', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <Countdown target={targetIn(-HOUR)} onComplete={onComplete} />,
    );

    expect(getValues(container)).toEqual(['00', '00', '00', '00']);
    expect(onComplete).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('cleans up its interval on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = render(<Countdown target={targetIn(HOUR)} />);

    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  // ─── hideZeroUnits ──────────────────────────────────────

  it('drops leading zero units when hideZeroUnits is set', () => {
    const { container } = render(
      <Countdown target={targetIn(5 * MINUTE + 30_000)} hideZeroUnits />,
    );

    expect(getValues(container)).toEqual(['05', '30']);
    const labels = Array.from(
      container.querySelectorAll('.ds-countdown__label'),
    ).map((el) => el.textContent);
    expect(labels).toEqual(['mins', 'secs']);
  });

  it('always keeps the seconds segment even at zero', () => {
    const { container } = render(<Countdown target={targetIn(-1_000)} hideZeroUnits />);
    expect(getValues(container)).toEqual(['00']);
  });

  // ─── Screen reader behavior ─────────────────────────────

  it('hides the visual digits from assistive technology', () => {
    const { container } = render(<Countdown target={targetIn(DAY)} />);
    const display = container.querySelector('.ds-countdown__display');
    expect(display).toHaveAttribute('aria-hidden', 'true');
  });

  it('exposes a single polite live region with a human phrase', () => {
    const { container } = render(
      <Countdown target={targetIn(2 * DAY + 3 * HOUR)} />,
    );
    const regions = container.querySelectorAll('[aria-live="polite"]');
    expect(regions).toHaveLength(1);
    expect(getAnnouncement(container)).toBe('2 days, 3 hours remaining');
  });

  it('does not change the live region text within the same minute', () => {
    const { container } = render(<Countdown target={targetIn(5 * MINUTE + 45_000)} />);
    expect(getAnnouncement(container)).toBe('5 minutes remaining');

    // 30 seconds of ticking — digits change, phrase must not.
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(getAnnouncement(container)).toBe('5 minutes remaining');

    // Crossing the minute boundary updates the phrase.
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(getAnnouncement(container)).toBe('4 minutes remaining');
  });

  it('announces sub-minute and completed states', () => {
    const { container } = render(<Countdown target={targetIn(30_000)} />);
    expect(getAnnouncement(container)).toBe('Less than a minute remaining');

    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(getAnnouncement(container)).toBe('Countdown complete');
  });

  // ─── Variants & pass-through ────────────────────────────

  it('applies the size class', () => {
    const { container, rerender } = render(<Countdown target={targetIn(DAY)} />);
    expect(container.querySelector('.ds-countdown--md')).toBeInTheDocument();

    rerender(<Countdown target={targetIn(DAY)} size="sm" />);
    expect(container.querySelector('.ds-countdown--sm')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(
      <Countdown target={targetIn(DAY)} className="custom" />,
    );
    expect(container.querySelector('.ds-countdown')).toHaveClass('custom');
  });

  it('passes through html attributes', () => {
    render(<Countdown target={targetIn(DAY)} data-testid="sale-timer" />);
    expect(screen.getByTestId('sale-timer')).toBeInTheDocument();
  });

  // ─── Accessibility ──────────────────────────────────────

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Countdown target={targetIn(2 * DAY)} />
        <Countdown target={targetIn(5 * MINUTE)} size="sm" hideZeroUnits />
      </div>,
    );
    // axe runs its own async checks — keep fake timers out of its way.
    vi.useRealTimers();
    expect(await axe(container)).toHaveNoViolations();
  });
});
