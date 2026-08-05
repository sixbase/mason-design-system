import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Check } from '../icon';
import { Tag } from './Tag';

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

  it('falls back to a generic label for non-string children', () => {
    render(
      <Tag onDismiss={() => {}}>
        <em>Blue</em>
      </Tag>,
    );
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
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
