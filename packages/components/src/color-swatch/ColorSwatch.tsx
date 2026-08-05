import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './ColorSwatch.css';

export interface ColorSwatchProps extends HTMLAttributes<HTMLDivElement> {
  /** CSS color value or CSS variable reference */
  color: string;
  /** Token name label */
  name: string;
  /** Optional hex / raw value to display */
  value?: string;
}

/**
 * ColorSwatch
 *
 * Displays a color token visually — used in the docs token page.
 *
 * Accessibility: the color sample is an image of the color, so it gets
 * `role="img"` with an `aria-label` that names the token AND its resolved
 * color value — a screen reader user hears the actual color, not just
 * an abstract token name.
 */
export const ColorSwatch = forwardRef<HTMLDivElement, ColorSwatchProps>(function ColorSwatch(
  { color, name, value, className, ...props },
  ref,
) {
  // Prefer the display value (resolved hex) when provided; fall back to
  // the CSS color expression itself.
  const resolvedValue = value ?? color;

  return (
    <div ref={ref} className={['ds-color-swatch', className].filter(Boolean).join(' ')} {...props}>
      <div
        className="ds-color-swatch__sample"
        style={{ backgroundColor: color }}
        role="img"
        aria-label={`${name}: ${resolvedValue}`}
      />
      <div className="ds-color-swatch__info">
        <span className="ds-color-swatch__name">{name}</span>
        {value && <span className="ds-color-swatch__value">{value}</span>}
      </div>
    </div>
  );
});

ColorSwatch.displayName = 'ColorSwatch';
