import { forwardRef, useId, useState } from 'react';
import type { HTMLAttributes, KeyboardEvent } from 'react';
import './StarRating.css';

export type StarRatingSize = 'sm' | 'md' | 'lg';

export interface StarRatingProps extends HTMLAttributes<HTMLDivElement> {
  /** Rating value from 0 to 5. Supports half values (e.g. 4.5) in display mode. */
  rating: number;
  /** Total number of reviews. */
  reviewCount?: number;
  /** Size variant. */
  size?: StarRatingSize;
  /**
   * Turns the rating into an interactive radiogroup (5 stars, click +
   * arrow keys). Called with the chosen rating (1–5). Omit for the
   * default read-only display mode.
   */
  onRate?: (rating: number) => void;
  /** Optional visible label rendered before the stars. */
  label?: string;
}

const STAR_COUNT = 5;

function StarIcon({ fill, clipId }: { fill: 'full' | 'half' | 'empty'; clipId: string }) {
  return (
    <svg
      className={`ds-star-rating__star ds-star-rating__star--${fill}`}
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      {fill === 'half' ? (
        <>
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y="0" width="10" height="20" />
            </clipPath>
          </defs>
          <path
            d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.26 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z"
            className="ds-star-rating__star-bg"
          />
          <path
            d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.26 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z"
            clipPath={`url(#${clipId})`}
            className="ds-star-rating__star-fill"
          />
        </>
      ) : (
        <path
          d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.26 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z"
          className={
            fill === 'full'
              ? 'ds-star-rating__star-fill'
              : 'ds-star-rating__star-bg'
          }
        />
      )}
    </svg>
  );
}

function starFills(value: number): Array<'full' | 'half' | 'empty'> {
  return Array.from({ length: STAR_COUNT }, (_, i) => {
    if (value >= i + 1) return 'full';
    if (value >= i + 0.5) return 'half';
    return 'empty';
  });
}

export const StarRating = forwardRef<HTMLDivElement, StarRatingProps>(
  function StarRating(
    { rating, reviewCount, size = 'md', onRate, label, className, ...props },
    ref,
  ) {
    const clipId = useId();
    const labelId = useId();
    const [previewValue, setPreviewValue] = useState<number | null>(null);
    const clamped = Math.max(0, Math.min(STAR_COUNT, rating));
    const interactive = onRate != null;

    const count = reviewCount != null && (
      <span className="ds-star-rating__count">
        ({reviewCount.toLocaleString()}{' '}
        {reviewCount === 1 ? 'review' : 'reviews'})
      </span>
    );

    if (!interactive) {
      return (
        <div
          ref={ref}
          className={[
            'ds-star-rating',
            `ds-star-rating--${size}`,
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={
            label
              ? `${label}: ${clamped} out of ${STAR_COUNT} stars`
              : `${clamped} out of ${STAR_COUNT} stars`
          }
          role="img"
          {...props}
        >
          {label && <span className="ds-star-rating__label">{label}</span>}
          <span className="ds-star-rating__stars">
            {starFills(clamped).map((fill, i) => (
              <StarIcon key={i} fill={fill} clipId={`${clipId}-half`} />
            ))}
          </span>
          {count}
        </div>
      );
    }

    // Interactive mode: radiogroup of 5 stars. Hover previews the fill;
    // arrow keys move + select per the WAI-ARIA radio pattern.
    const selected = Math.round(clamped);
    const fills = starFills(previewValue ?? clamped);

    const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
      let next: number | null = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        next = selected >= STAR_COUNT ? 1 : selected + 1;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        next = selected <= 1 ? STAR_COUNT : selected - 1;
      }
      if (next != null) {
        onRate(next);
        const radios = e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]');
        radios[next - 1]?.focus();
      }
    };

    return (
      <div
        ref={ref}
        className={[
          'ds-star-rating',
          `ds-star-rating--${size}`,
          'ds-star-rating--interactive',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {label && (
          <span className="ds-star-rating__label" id={labelId}>
            {label}
          </span>
        )}
        <span
          className="ds-star-rating__stars"
          role="radiogroup"
          aria-label={label ? undefined : 'Rating'}
          aria-labelledby={label ? labelId : undefined}
          onKeyDown={handleKeyDown}
          onMouseLeave={() => setPreviewValue(null)}
        >
          {fills.map((fill, i) => {
            const value = i + 1;
            const isChecked = selected === value;
            return (
              <button
                key={i}
                type="button"
                className="ds-star-rating__radio"
                role="radio"
                aria-checked={isChecked}
                aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`}
                // Roving tabindex; first star is the entry point when unrated
                tabIndex={isChecked || (selected === 0 && value === 1) ? 0 : -1}
                onClick={() => onRate(value)}
                onMouseEnter={() => setPreviewValue(value)}
              >
                <StarIcon fill={fill} clipId={`${clipId}-half-${i}`} />
              </button>
            );
          })}
        </span>
        {count}
      </div>
    );
  },
);
StarRating.displayName = 'StarRating';
