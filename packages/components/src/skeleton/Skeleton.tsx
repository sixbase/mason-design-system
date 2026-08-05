import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './Skeleton.css';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Shape of the skeleton placeholder */
  variant?: SkeletonVariant;
  /**
   * CSS width — accepts token references (`"var(--spacing-20)"`),
   * any CSS length (`"75%"`, `"12ch"`), or a number (px). Defaults to 100%.
   * Prefer tokens so placeholder dimensions match the content they mimic.
   */
  width?: string | number;
  /**
   * CSS height — accepts token references (`"var(--spacing-12)"`),
   * any CSS length, or a number (px).
   */
  height?: string | number;
  /** Number of text lines to render (text variant only, default: 1) */
  lines?: number;
  /** Enable shimmer animation (default: true, respects prefers-reduced-motion) */
  animate?: boolean;
}

/**
 * Skeleton
 *
 * A pulsing placeholder that indicates content is loading.
 * Matches the shape of what it replaces — text lines, avatars,
 * images, cards, or any async content area.
 *
 * Accessibility:
 * - Renders with `aria-hidden="true"` — purely decorative
 * - Wrapping container should have `aria-busy="true"` and `aria-label="Loading"`
 * - Animation pauses when `prefers-reduced-motion: reduce` is active
 *
 * @example
 * <Skeleton variant="rectangular" width={300} height={200} />
 * <Skeleton variant="circular" width="var(--spacing-12)" height="var(--spacing-12)" />
 * <Skeleton variant="text" lines={3} />
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { variant = 'rectangular', width, height, lines = 1, animate = true, className, style, ...props },
  ref,
) {
  const resolvedWidth = typeof width === 'number' ? `${width}px` : width;
  const resolvedHeight = typeof height === 'number' ? `${height}px` : height;

  // Text variant with multiple lines renders a group
  if (variant === 'text' && lines > 1) {
    const groupClasses = [
      'ds-skeleton-group',
      !animate && 'ds-skeleton--static',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={groupClasses}
        aria-hidden="true"
        style={{ ...style, width: resolvedWidth }}
        {...props}
      >
        {Array.from({ length: lines }, (_, i) => {
          const isLast = i === lines - 1;
          const lineClasses = [
            'ds-skeleton',
            'ds-skeleton--text',
            !animate && 'ds-skeleton--static',
            isLast && 'ds-skeleton--text-last',
          ]
            .filter(Boolean)
            .join(' ');

          return <div key={i} className={lineClasses} />;
        })}
      </div>
    );
  }

  const classes = [
    'ds-skeleton',
    `ds-skeleton--${variant}`,
    !animate && 'ds-skeleton--static',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      aria-hidden="true"
      style={{
        ...style,
        ...(resolvedWidth ? { width: resolvedWidth } : undefined),
        ...(resolvedHeight ? { height: resolvedHeight } : undefined),
      }}
      {...props}
    />
  );
});

Skeleton.displayName = 'Skeleton';
