import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Text } from '../typography/Typography';
import './ProgressBar.css';

export type ProgressBarVariant = 'default' | 'success';
export type ProgressBarSize = 'sm' | 'md';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Current progress value (0–100) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Accessible label for the progress bar */
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
      max = 100,
      label,
      showValue = false,
      valueText,
      size = 'md',
      variant = 'default',
      className,
      ...props
    },
    ref,
  ) {
    // Clamp percentage between 0 and 100
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const isComplete = percentage >= 100;

    // Resolve variant: success at 100% if variant is 'success'
    const resolvedVariant =
      variant === 'success' && isComplete ? 'success' : 'default';

    const classes = [
      'ds-progress-bar',
      `ds-progress-bar--${size}`,
      `ds-progress-bar--${resolvedVariant}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Display text: custom valueText, or percentage if showValue
    const displayText = valueText ?? (showValue ? `${Math.round(percentage)}%` : undefined);
    // Only the auto percentage is a pure numeral — custom valueText may be a
    // full sentence, so it keeps the body font.
    const isNumericValue = valueText == null && showValue;

    return (
      <div ref={ref} className={classes} {...props}>
        {label && (
          <Text as="span" size="sm" className="ds-progress-bar__label">
            {label}
          </Text>
        )}
        <progress
          className="ds-progress-bar__track"
          value={value}
          max={max}
          aria-label={label}
          aria-valuenow={Math.round(percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={valueText}
        />
        {displayText && (
          <Text
            as="span"
            size="sm"
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
