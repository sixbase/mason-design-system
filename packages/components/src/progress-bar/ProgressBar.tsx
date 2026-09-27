import { forwardRef, useEffect } from 'react';
import type { HTMLAttributes } from 'react';
import { Text } from '../typography/Typography';
import { devWarning } from '../internal/dev-warning';
import './ProgressBar.css';

export type ProgressBarVariant = 'default' | 'success';
export type ProgressBarSize = 'sm' | 'md';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Current progress value (0–100). Required unless `indeterminate`. */
  value?: number;
  /**
   * Unknown-duration loading: shows a looping sweep animation instead of
   * a fill. Exposes `aria-valuetext` (`valueText`, else "Loading") and no
   * `aria-valuenow`.
   * Under prefers-reduced-motion (or `<html data-motion="off">`) the sweep
   * is replaced by a static mid-track fill. `value`, `showValue`, and
   * `variant` are ignored.
   */
  indeterminate?: boolean;
  /** Maximum value (default: 100) */
  max?: number;
  /**
   * Visible label, also the bar's accessible name. For a bar with no
   * visible label, pass `aria-label` (or `aria-labelledby`) instead — both
   * are put on the bar itself, not the wrapper.
   */
  label?: string;
  /** Show percentage text below the bar */
  showValue?: boolean;
  /** Custom value text (e.g., "$12 away from free shipping") */
  valueText?: string;
  /** Size of the progress bar track */
  size?: ProgressBarSize;
  /** Visual variant — success turns green at 100% */
  variant?: ProgressBarVariant;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar(
    {
      value,
      indeterminate = false,
      max = 100,
      label,
      showValue = false,
      valueText,
      size = 'md',
      variant = 'default',
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...props
    },
    ref,
  ) {
    // The name belongs on the bar. On the wrapper <div> (where `...props`
    // lands) an aria-label is ignored, and an unnamed bar was read as a
    // bare "progress bar, 50%".
    const barLabel = label ?? ariaLabel;
    useEffect(() => {
      if (!indeterminate && !barLabel && !ariaLabelledBy) {
        devWarning(
          'ProgressBar:name',
          'ProgressBar has no accessible name — pass `label`, or `aria-label` when no ' +
            'visible label is wanted.',
        );
      }
    }, [indeterminate, barLabel, ariaLabelledBy]);

    // Sanitize before any math: a NaN value (e.g. an unparsed API field)
    // or a non-positive max used to leak "NaN" into aria-valuenow, the
    // native value attribute, and the visible "NaN%" label.
    const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
    const safeValue = Number.isFinite(value) ? Math.min(safeMax, Math.max(0, value as number)) : 0;
    const percentage = (safeValue / safeMax) * 100;
    const isComplete = percentage >= 100;

    // Resolve variant: success at 100% if variant is 'success'
    const resolvedVariant =
      variant === 'success' && isComplete && !indeterminate ? 'success' : 'default';

    const classes = [
      'ds-progress-bar',
      `ds-progress-bar--${size}`,
      `ds-progress-bar--${resolvedVariant}`,
      indeterminate && 'ds-progress-bar--indeterminate',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Display text: custom valueText, or percentage if showValue
    const displayText = indeterminate
      ? valueText
      : valueText ?? (showValue ? `${Math.round(percentage)}%` : undefined);
    // Only the auto percentage is a pure numeral — custom valueText may be a
    // full sentence, so it keeps the body font.
    const isNumericValue = valueText == null && showValue && !indeterminate;

    return (
      <div ref={ref} className={classes} {...props}>
        {label && (
          <Text as="span" size="sm" className="ds-progress-bar__label">
            {label}
          </Text>
        )}
        {indeterminate ? (
          /* Div-based track: a native <progress> without value is
             indeterminate, but its animation is not stylable
             cross-browser — the div gives us a token-driven sweep. */
          <div
            className="ds-progress-bar__track ds-progress-bar__track--indeterminate"
            role="progressbar"
            aria-label={ariaLabelledBy ? undefined : barLabel ?? 'Loading'}
            aria-labelledby={ariaLabelledBy}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={valueText ?? 'Loading'}
          >
            <div className="ds-progress-bar__indeterminate-fill" />
          </div>
        ) : (
          <progress
            className="ds-progress-bar__track"
            value={safeValue}
            max={safeMax}
            aria-label={ariaLabelledBy ? undefined : barLabel}
            aria-labelledby={ariaLabelledBy}
            aria-valuenow={Math.round(percentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={valueText}
          />
        )}
        {/* Visual copy of what the bar already exposes (aria-valuenow /
            aria-valuetext) — hidden so "45%" is not read twice. */}
        {displayText && (
          <Text
            as="span"
            size="sm"
            aria-hidden="true"
            className={[
              'ds-progress-bar__value-text',
              isNumericValue && 'ds-progress-bar__value-text--numeric',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {displayText}
          </Text>
        )}
      </div>
    );
  },
);

ProgressBar.displayName = 'ProgressBar';
