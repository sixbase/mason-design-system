import { forwardRef } from 'react';
import type { ReactNode, SVGAttributes } from 'react';

export type IconSize = 'sm' | 'md' | 'lg';

export interface IconSvgProps extends SVGAttributes<SVGElement> {
  /** Icon size — sm (16px), md (20px), lg (24px). Default 'md'. */
  size?: IconSize;
  /** Accessible label — required when decorative={false} */
  label?: string;
  /** When true (default), icon is hidden from assistive tech */
  decorative?: boolean;
}

function createIcon(displayName: string, children: ReactNode) {
  const Component = forwardRef<SVGSVGElement, IconSvgProps>(
    function IconComponent(
      { size = 'md', label, decorative = true, className, ...props },
      ref,
    ) {
      const classes = ['ds-icon', `ds-icon--${size}`, className]
        .filter(Boolean)
        .join(' ');
      const ariaProps = decorative
        ? { 'aria-hidden': true as const }
        : { role: 'img' as const, 'aria-label': label };
      return (
        <svg
          ref={ref}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={classes}
          {...ariaProps}
          {...props}
        >
          {children}
        </svg>
      );
    },
  );
  Component.displayName = displayName;
  return Component;
}

export const X = createIcon(
  'XIcon',
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>,
);

export const Check = createIcon(
  'CheckIcon',
  <polyline points="20 6 9 17 4 12" />,
);

export const ChevronDown = createIcon(
  'ChevronDownIcon',
  <polyline points="6 9 12 15 18 9" />,
);

export const ChevronUp = createIcon(
  'ChevronUpIcon',
  <polyline points="18 15 12 9 6 15" />,
);

export const ChevronLeft = createIcon(
  'ChevronLeftIcon',
  <polyline points="15 18 9 12 15 6" />,
);

export const ChevronRight = createIcon(
  'ChevronRightIcon',
  <polyline points="9 18 15 12 9 6" />,
);

export const Plus = createIcon(
  'PlusIcon',
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>,
);

export const Minus = createIcon(
  'MinusIcon',
  <line x1="5" y1="12" x2="19" y2="12" />,
);

export const Search = createIcon(
  'SearchIcon',
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </>,
);

export const Sun = createIcon(
  'SunIcon',
  <>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </>,
);

export const Moon = createIcon(
  'MoonIcon',
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
);

export const Info = createIcon(
  'InfoIcon',
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </>,
);

export const CircleCheck = createIcon(
  'CircleCheckIcon',
  <>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </>,
);

export const TriangleAlert = createIcon(
  'TriangleAlertIcon',
  <>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>,
);

export const CircleX = createIcon(
  'CircleXIcon',
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </>,
);

export const Image = createIcon(
  'ImageIcon',
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </>,
);

export const ShoppingBag = createIcon(
  'ShoppingBagIcon',
  <>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </>,
);

export const ShoppingCart = createIcon(
  'ShoppingCartIcon',
  <>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </>,
);

export const Heart = createIcon(
  'HeartIcon',
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
);
