import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Check } from '../icon';
import { Tag } from './Tag';

/** Declarations of the top-level rule whose selector is exactly `selector`. */
function cssRule(selector: string): string {
  const css = readFileSync(resolve(__dirname, 'Tag.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`(?:^|})\\s*${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
}

describe('Tag', () => {
  it('renders with text content', () => {
    render(<Tag>Blue</Tag>);
    expect(screen.getByText('Blue')).toBeInTheDocument();
  });

  it('applies default variant and size classes', () => {
    render(<Tag data-testid="tag">Blue</Tag>);
    const tag = screen.getByTestId('tag');
    expect(tag).toHaveClass('ds-tag--default');
    expect(tag).toHaveClass('ds-tag--md');
  });

  it('applies variant class', () => {
    render(<Tag data-testid="tag" variant="outline">Size: M</Tag>);
    expect(screen.getByTestId('tag')).toHaveClass('ds-tag--outline');
  });

  it('applies size class', () => {
    render(<Tag data-testid="tag" size="sm">Blue</Tag>);
    expect(screen.getByTestId('tag')).toHaveClass('ds-tag--sm');
  });

  it('merges custom className', () => {
    render(<Tag data-testid="tag" className="custom">Blue</Tag>);
    expect(screen.getByTestId('tag')).toHaveClass('custom', 'ds-tag');
  });

  it('passes through html attributes', () => {
    render(<Tag data-testid="tag-el">Blue</Tag>);
    expect(screen.getByTestId('tag-el')).toBeInTheDocument();
  });

  it('renders a leading icon when provided', () => {
    render(
      <Tag data-testid="tag" icon={<Check data-testid="tag-icon" />}>
        Applied
      </Tag>,
    );
    expect(screen.getByTestId('tag-icon')).toBeInTheDocument();
  });

  /* ─── Dismissible ────────────────────────────────────────────── */

  it('does not render a remove button without onDismiss', () => {
    render(<Tag>Blue</Tag>);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders a remove button with auto aria-label when onDismiss is set', () => {
    render(<Tag onDismiss={() => {}}>Blue</Tag>);
    expect(screen.getByRole('button', { name: 'Remove Blue' })).toBeInTheDocument();
  });

  it('uses type="button" on the remove button', () => {
    render(<Tag onDismiss={() => {}}>Blue</Tag>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('calls onDismiss when the remove button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Tag onDismiss={onDismiss}>Blue</Tag>);
    await user.click(screen.getByRole('button', { name: 'Remove Blue' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard activation of the remove button', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Tag onDismiss={onDismiss}>Blue</Tag>);
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('honors an explicit removeLabel', () => {
    render(
      <Tag onDismiss={() => {}} removeLabel="Remove color filter Blue">
        Blue
      </Tag>,
    );
    expect(
      screen.getByRole('button', { name: 'Remove color filter Blue' }),
    ).toBeInTheDocument();
  });

  // Regression: JSX like `Color: {color}` arrives as an array, so every
  // such tag got an identical, ambiguous "Remove" button.
  it('derives the remove label from JSX text children', () => {
    const color = 'Blue';
    render(<Tag onDismiss={() => {}}>Color: {color}</Tag>);
    expect(screen.getByRole('button', { name: 'Remove Color: Blue' })).toBeInTheDocument();
  });

  it('derives the remove label from numeric children', () => {
    render(<Tag onDismiss={() => {}}>{42}</Tag>);
    expect(screen.getByRole('button', { name: 'Remove 42' })).toBeInTheDocument();
  });

  it('falls back to a generic label for non-string children', () => {
    render(
      <Tag onDismiss={() => {}}>
        <em>Blue</em>
      </Tag>,
    );
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  /* ─── Styles ─────────────────────────────────────────────────── */

  // Regression: long labels were nowrap with no cap, so a long filter
  // value pushed the pill past a 320px viewport.
  it('caps the pill at its row width and ellipsizes the label', () => {
    expect(cssRule('.ds-tag')).toMatch(/max-width:\s*100%/);
    const label = cssRule('.ds-tag__label');
    expect(label).toMatch(/min-width:\s*0/);
    expect(label).toMatch(/overflow-x:\s*clip/);
    expect(label).toMatch(/text-overflow:\s*ellipsis/);
  });

  // Regression: the 24px remove button made a dismissible md tag 42px
  // tall next to a 26px plain tag.
  it('cancels the remove button extra height so dismissible tags match', () => {
    expect(cssRule('.ds-tag--md .ds-tag__remove')).toMatch(
      /margin-block:\s*calc\(var\(--spacing-2\) \* -1\)/,
    );
    expect(cssRule('.ds-tag--sm .ds-tag__remove')).toMatch(
      /margin-block:\s*calc\(var\(--spacing-1\) \* -1\)/,
    );
  });

  // Regression: the dimmed X on an outline tag measured 2.65:1 on the
  // light page background (WCAG 1.4.11 needs 3:1).
  it('does not dim the remove icon on the outline variant', () => {
    expect(cssRule('.ds-tag--outline .ds-tag__remove')).toMatch(/opacity:\s*var\(--opacity-full\)/);
  });

  it('keeps a transparent focus outline for forced-colors mode', () => {
    expect(cssRule('.ds-tag__remove:focus-visible')).toMatch(
      /outline:\s*var\(--border-width-lg\) solid transparent/,
    );
  });

  /* ─── Accessibility ──────────────────────────────────────────── */

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Tag>Blue</Tag>
        <Tag variant="outline">Size: M</Tag>
        <Tag onDismiss={() => {}}>Under $50</Tag>
        <Tag icon={<Check />} onDismiss={() => {}}>
          In stock
        </Tag>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
