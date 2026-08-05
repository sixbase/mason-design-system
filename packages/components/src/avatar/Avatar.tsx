import { forwardRef, useEffect, useState } from 'react';
import type { HTMLAttributes } from 'react';
import './Avatar.css';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarShape = 'circle' | 'square';

/** Number of fallback background tones (must match Avatar.css). */
const TONE_COUNT = 5;

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Person or entity name. Required — drives the initials fallback,
   * the image alt text, and the deterministic fallback tone.
   */
  name: string;
  /**
   * Image URL. Falls back to initials when omitted or when the
   * image fails to load.
   */
  src?: string;
  /** Size — Fibonacci control heights: sm 34px, md 42px, lg 55px */
  size?: AvatarSize;
  /** Shape — circle (default) or square with medium radius */
  shape?: AvatarShape;
}

/** Derive up to 2 uppercase initials from a name. */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  if (!first) return '';
  const last = words.length > 1 ? words[words.length - 1] : undefined;
  return (
    first.charAt(0).toUpperCase() + (last ? last.charAt(0).toUpperCase() : '')
  );
}

/** Deterministic tone index from a name — same name, same tone. */
function getTone(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }
  return hash % TONE_COUNT;
}

/**
 * Avatar
 *
 * A user or entity image with graceful fallback to initials.
 * Falls back when no `src` is given or when the image fails to load.
 * The fallback background rotates through a small set of muted
 * semantic tones, keyed deterministically by name hash.
 *
 * Accessibility:
 * - Image mode: `<img>` receives `alt={name}`
 * - Fallback mode: root receives `role="img"` + `aria-label={name}`;
 *   initials are hidden from assistive tech
 *
 * @example
 * <Avatar name="Ada Lovelace" src="/ada.jpg" />
 * <Avatar name="Ada Lovelace" />              // initials "AL"
 * <Avatar name="Mason Supply" shape="square" size="lg" />
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, size = 'md', shape = 'circle', className, ...props },
  ref,
) {
  const [failed, setFailed] = useState(false);

  // A new src deserves a fresh attempt.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = Boolean(src) && !failed;

  const classes = [
    'ds-avatar',
    `ds-avatar--${size}`,
    shape === 'square' && 'ds-avatar--square',
    !showImage && `ds-avatar--tone-${getTone(name)}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      ref={ref}
      className={classes}
      {...(!showImage ? { role: 'img', 'aria-label': name } : {})}
      {...props}
    >
      {showImage ? (
        <img
          className="ds-avatar__image"
          src={src}
          alt={name}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="ds-avatar__initials" aria-hidden="true">
          {getInitials(name)}
        </span>
      )}
    </span>
  );
});

Avatar.displayName = 'Avatar';
