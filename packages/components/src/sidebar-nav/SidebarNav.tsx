import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Badge } from '../badge/Badge';
import { ChevronDown } from '../icon';
import './SidebarNav.css';

// ─── Types ────────────────────────────────────────────────

export type SidebarNavItem = {
  /** Link label text */
  label: string;
  /** Link destination */
  href: string;
  /** Optional leading icon */
  icon?: ReactNode;
  /** Optional badge (text or count) */
  badge?: string | number;
  /** Marks this item as the current page */
  active?: boolean;
  /** Prevents interaction */
  disabled?: boolean;
};

export type SidebarNavGroup = {
  /** Optional group heading */
  heading?: string;
  /** Whether this group can be collapsed */
  collapsible?: boolean;
  /** Whether the collapsible group starts open (default: true) */
  defaultOpen?: boolean;
  /** Navigation items in this group */
  items: SidebarNavItem[];
};

export interface SidebarNavProps extends HTMLAttributes<HTMLElement> {
  /** Navigation groups to render */
  groups: SidebarNavGroup[];
  /** Size variant */
  size?: 'sm' | 'md';
}

// ─── Item List ───────────────────────────────────────────

function NavItemList({
  items,
  size,
}: {
  items: SidebarNavItem[];
  size: 'sm' | 'md';
}) {
  return (
    <ul className="ds-sidebar-nav__list">
      {items.map((item) => {
        const linkClasses = [
          'ds-sidebar-nav__link',
          `ds-sidebar-nav__link--${size}`,
          item.active && 'ds-sidebar-nav__link--active',
          item.disabled && 'ds-sidebar-nav__link--disabled',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <li key={item.href} className="ds-sidebar-nav__item">
            {item.disabled ? (
              <span
                className={linkClasses}
                aria-disabled="true"
              >
                {item.icon && (
                  <span className="ds-sidebar-nav__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="ds-sidebar-nav__label">{item.label}</span>
                {item.badge != null && (
                  <Badge
                    variant="secondary"
                    size="sm"
                    className="ds-sidebar-nav__badge"
                  >
                    {item.badge}
                  </Badge>
                )}
              </span>
            ) : (
              <a
                href={item.href}
                className={linkClasses}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.icon && (
                  <span className="ds-sidebar-nav__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="ds-sidebar-nav__label">{item.label}</span>
                {item.badge != null && (
                  <Badge
                    variant="secondary"
                    size="sm"
                    className="ds-sidebar-nav__badge"
                  >
                    {item.badge}
                  </Badge>
                )}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ─── Collapsible Group ───────────────────────────────────

function CollapsibleGroup({
  group,
  size,
  index,
}: {
  group: SidebarNavGroup;
  size: 'sm' | 'md';
  index: number;
}) {
  const value = `group-${index}`;

  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      defaultValue={group.defaultOpen !== false ? value : undefined}
      className="ds-sidebar-nav__collapsible"
    >
      <AccordionPrimitive.Item value={value}>
        <AccordionPrimitive.Header className="ds-sidebar-nav__collapsible-header">
          <AccordionPrimitive.Trigger className="ds-sidebar-nav__collapsible-trigger">
            <span className="ds-sidebar-nav__heading">{group.heading}</span>
            <ChevronDown size="sm" className="ds-sidebar-nav__chevron" />
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content className="ds-sidebar-nav__collapsible-content">
          <NavItemList items={group.items} size={size} />
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  );
}

// ─── Static Group ────────────────────────────────────────

function StaticGroup({
  group,
  size,
}: {
  group: SidebarNavGroup;
  size: 'sm' | 'md';
}) {
  return (
    <div className="ds-sidebar-nav__group">
      {group.heading && (
        <p className="ds-sidebar-nav__heading">{group.heading}</p>
      )}
      <NavItemList items={group.items} size={size} />
    </div>
  );
}

// ─── Mobile Select ───────────────────────────────────────

function MobileSelect({ groups }: { groups: SidebarNavGroup[] }) {
  const allItems = groups.flatMap((g) => g.items);
  const activeItem = allItems.find((item) => item.active);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const href = e.target.value;
    if (href) {
      window.location.href = href;
    }
  }

  return (
    <div className="ds-sidebar-nav__mobile">
      <label className="ds-sidebar-nav__mobile-label" htmlFor="sidebar-nav-mobile">
        Navigation
      </label>
      <select
        id="sidebar-nav-mobile"
        className="ds-sidebar-nav__mobile-select"
        value={activeItem?.href ?? ''}
        onChange={handleChange}
      >
        {groups.map((group, gi) => {
          const items = group.items.filter((item) => !item.disabled);
          if (items.length === 0) return null;

          if (group.heading) {
            return (
              <optgroup key={gi} label={group.heading}>
                {items.map((item) => (
                  <option key={item.href} value={item.href}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            );
          }

          return items.map((item) => (
            <option key={item.href} value={item.href}>
              {item.label}
            </option>
          ));
        })}
      </select>
    </div>
  );
}

// ─── SidebarNav ──────────────────────────────────────────

/**
 * SidebarNav
 *
 * Vertical navigation for account pages, help centers, or collection filter sidebars.
 * Supports active state, grouped sections with headings, and collapsible groups.
 *
 * On mobile (<768px), collapses to a native `<select>` dropdown.
 *
 * @example
 * ```tsx
 * <SidebarNav
 *   aria-label="Account"
 *   groups={[
 *     {
 *       heading: 'Account',
 *       items: [
 *         { label: 'Profile', href: '/account', active: true },
 *         { label: 'Orders', href: '/account/orders', badge: 3 },
 *         { label: 'Addresses', href: '/account/addresses' },
 *       ],
 *     },
 *   ]}
 * />
 * ```
 */
export const SidebarNav = forwardRef<HTMLElement, SidebarNavProps>(
  function SidebarNav(
    { groups, size = 'md', className, 'aria-label': ariaLabel = 'Sidebar', ...props },
    ref,
  ) {
    const filteredGroups = groups.filter((g) => g.items.length > 0);

    if (filteredGroups.length === 0) return null;

    const classes = [
      'ds-sidebar-nav',
      `ds-sidebar-nav--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <nav ref={ref} className={classes} aria-label={ariaLabel} {...props}>
        {/* Desktop: full vertical nav */}
        <div className="ds-sidebar-nav__desktop">
          {filteredGroups.map((group, i) =>
            group.collapsible && group.heading ? (
              <CollapsibleGroup key={i} group={group} size={size} index={i} />
            ) : (
              <StaticGroup key={i} group={group} size={size} />
            ),
          )}
        </div>

        {/* Mobile: native select */}
        <MobileSelect groups={filteredGroups} />
      </nav>
    );
  },
);
SidebarNav.displayName = 'SidebarNav';
