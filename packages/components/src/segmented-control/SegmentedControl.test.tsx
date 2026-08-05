import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl, SegmentedControlItem } from './SegmentedControl';

function renderControl(props: Record<string, unknown> = {}) {
  return render(
    <SegmentedControl aria-label="View" defaultValue="grid" {...props}>
      <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
      <SegmentedControlItem value="list">List</SegmentedControlItem>
      <SegmentedControlItem value="map">Map</SegmentedControlItem>
    </SegmentedControl>,
  );
}

describe('SegmentedControl', () => {
  // ─── Base rendering ─────────────────────────────────────

  it('renders a radiogroup with radio segments', () => {
    renderControl();
    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('renders segments as type="button" elements', () => {
    renderControl();
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio.tagName).toBe('BUTTON');
      expect(radio).toHaveAttribute('type', 'button');
    }
  });

  it('marks the default value as checked', () => {
    renderControl();
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'false');
  });

  it('exposes count and selected index for the sliding indicator', () => {
    const { container } = renderControl({ defaultValue: 'list' });
    const root = container.querySelector('.ds-segmented-control');
    expect(root).toHaveAttribute('data-count', '3');
    expect(root).toHaveAttribute('data-index', '1');
  });

  it('renders the indicator as presentational', () => {
    const { container } = renderControl();
    const indicator = container.querySelector('.ds-segmented-control__indicator');
    expect(indicator).toHaveAttribute('aria-hidden', 'true');
  });

  it('omits data-index when nothing is selected', () => {
    const { container } = render(
      <SegmentedControl aria-label="View">
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="list">List</SegmentedControlItem>
      </SegmentedControl>,
    );
    expect(container.querySelector('.ds-segmented-control')).not.toHaveAttribute('data-index');
  });

  // ─── Selection ──────────────────────────────────────────

  it('selects a segment on click and calls onValueChange', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    renderControl({ onValueChange });

    await user.click(screen.getByRole('radio', { name: 'List' }));

    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'false');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('list');
  });

  it('does not call onValueChange when re-selecting the current value', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    renderControl({ onValueChange });

    await user.click(screen.getByRole('radio', { name: 'Grid' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('supports controlled mode', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <SegmentedControl aria-label="View" value="grid" onValueChange={onValueChange}>
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="list">List</SegmentedControlItem>
      </SegmentedControl>,
    );

    await user.click(screen.getByRole('radio', { name: 'List' }));
    expect(onValueChange).toHaveBeenCalledWith('list');
    // Controlled: selection does not move until the prop changes.
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true');

    rerender(
      <SegmentedControl aria-label="View" value="list" onValueChange={onValueChange}>
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="list">List</SegmentedControlItem>
      </SegmentedControl>,
    );
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'true');
  });

  it('does not select a disabled segment', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <SegmentedControl aria-label="View" defaultValue="grid" onValueChange={onValueChange}>
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="list" disabled>List</SegmentedControlItem>
      </SegmentedControl>,
    );

    await user.click(screen.getByRole('radio', { name: 'List' }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true');
  });

  // ─── Roving tabindex ────────────────────────────────────

  it('makes only the selected segment tabbable', () => {
    renderControl({ defaultValue: 'list' });
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'Map' })).toHaveAttribute('tabindex', '-1');
  });

  it('makes the first segment tabbable when nothing is selected', () => {
    render(
      <SegmentedControl aria-label="View">
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="list">List</SegmentedControlItem>
      </SegmentedControl>,
    );
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('tabindex', '-1');
  });

  // ─── Keyboard navigation ────────────────────────────────

  it('moves focus and selection with arrow keys, wrapping at the ends', async () => {
    const user = userEvent.setup();
    renderControl();

    screen.getByRole('radio', { name: 'Grid' }).focus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'List' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'true');

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Map' })).toHaveFocus();

    // Wraps around
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true');

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Map' })).toHaveFocus();
  });

  it('supports Home and End keys', async () => {
    const user = userEvent.setup();
    renderControl({ defaultValue: 'list' });

    screen.getByRole('radio', { name: 'List' }).focus();

    await user.keyboard('{End}');
    expect(screen.getByRole('radio', { name: 'Map' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Map' })).toHaveAttribute('aria-checked', 'true');

    await user.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true');
  });

  it('skips disabled segments during arrow navigation', async () => {
    const user = userEvent.setup();
    render(
      <SegmentedControl aria-label="View" defaultValue="grid">
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="list" disabled>List</SegmentedControlItem>
        <SegmentedControlItem value="map">Map</SegmentedControlItem>
      </SegmentedControl>,
    );

    screen.getByRole('radio', { name: 'Grid' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Map' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Map' })).toHaveAttribute('aria-checked', 'true');
  });

  // ─── Icon-only segments ─────────────────────────────────

  it('supports icon-only segments with aria-label', () => {
    render(
      <SegmentedControl aria-label="View" defaultValue="grid">
        <SegmentedControlItem value="grid" aria-label="Grid view">
          <svg aria-hidden="true" viewBox="0 0 24 24" />
        </SegmentedControlItem>
        <SegmentedControlItem value="list" aria-label="List view">
          <svg aria-hidden="true" viewBox="0 0 24 24" />
        </SegmentedControlItem>
      </SegmentedControl>,
    );

    expect(screen.getByRole('radio', { name: 'Grid view' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'List view' })).toBeInTheDocument();
  });

  // ─── Variants & pass-through ────────────────────────────

  it('applies the size class', () => {
    const { container, rerender } = render(
      <SegmentedControl aria-label="View" defaultValue="grid">
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="list">List</SegmentedControlItem>
      </SegmentedControl>,
    );
    expect(container.querySelector('.ds-segmented-control--md')).toBeInTheDocument();

    rerender(
      <SegmentedControl aria-label="View" defaultValue="grid" size="sm">
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="list">List</SegmentedControlItem>
      </SegmentedControl>,
    );
    expect(container.querySelector('.ds-segmented-control--sm')).toBeInTheDocument();
  });

  it('merges custom className on root and items', () => {
    const { container } = render(
      <SegmentedControl aria-label="View" defaultValue="grid" className="custom-root">
        <SegmentedControlItem value="grid" className="custom-item">Grid</SegmentedControlItem>
        <SegmentedControlItem value="list">List</SegmentedControlItem>
      </SegmentedControl>,
    );
    expect(container.querySelector('.ds-segmented-control.custom-root')).toBeInTheDocument();
    expect(container.querySelector('.ds-segmented-control__item.custom-item')).toBeInTheDocument();
  });

  it('throws when an item is used outside the control', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(<SegmentedControlItem value="grid">Grid</SegmentedControlItem>),
    ).toThrow('SegmentedControlItem must be used within a SegmentedControl');
    spy.mockRestore();
  });

  // ─── Accessibility ──────────────────────────────────────

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <SegmentedControl aria-label="View" defaultValue="grid">
          <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
          <SegmentedControlItem value="list">List</SegmentedControlItem>
        </SegmentedControl>
        <SegmentedControl aria-label="Sort" defaultValue="newest" size="sm">
          <SegmentedControlItem value="newest">Newest</SegmentedControlItem>
          <SegmentedControlItem value="price">Price</SegmentedControlItem>
          <SegmentedControlItem value="rating">Rating</SegmentedControlItem>
        </SegmentedControl>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
