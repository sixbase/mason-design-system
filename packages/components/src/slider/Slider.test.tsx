import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Slider } from './Slider';

// Radix Slider measures thumbs with ResizeObserver, which jsdom lacks
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
});

describe('Slider', () => {
  it('renders a single slider thumb by default', () => {
    render(<Slider label="Volume" defaultValue={[50]} />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('renders two thumbs in range mode', () => {
    render(<Slider label="Price" defaultValue={[25, 80]} />);
    expect(screen.getAllByRole('slider')).toHaveLength(2);
  });

  it('uses the label as the thumb accessible name', () => {
    render(<Slider label="Volume" defaultValue={[50]} />);
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
  });

  it('derives minimum/maximum thumb names from the label in range mode', () => {
    render(<Slider label="Price" defaultValue={[25, 80]} />);
    expect(screen.getByRole('slider', { name: 'Price minimum' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Price maximum' })).toBeInTheDocument();
  });

  it('uses custom thumbLabels when provided', () => {
    render(
      <Slider
        label="Price"
        defaultValue={[25, 80]}
        thumbLabels={['Lowest price', 'Highest price']}
      />,
    );
    expect(screen.getByRole('slider', { name: 'Lowest price' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Highest price' })).toBeInTheDocument();
  });

  it('sets aria-valuenow from the value', () => {
    render(<Slider label="Volume" defaultValue={[60]} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '60');
  });

  it('sets aria-valuetext from formatValue', () => {
    render(
      <Slider
        label="Price"
        min={0}
        max={200}
        defaultValue={[25, 80]}
        formatValue={(v) => `$${v}`}
      />,
    );
    const thumbs = screen.getAllByRole('slider');
    expect(thumbs[0]).toHaveAttribute('aria-valuetext', '$25');
    expect(thumbs[1]).toHaveAttribute('aria-valuetext', '$80');
  });

  it('shows formatted values when showValue is set', () => {
    render(
      <Slider
        label="Price"
        min={0}
        max={200}
        defaultValue={[25, 80]}
        formatValue={(v) => `$${v}`}
        showValue
      />,
    );
    expect(screen.getByText('$25 – $80')).toBeInTheDocument();
  });

  it('updates the visible value while dragging via keyboard', async () => {
    const user = userEvent.setup();
    render(<Slider label="Volume" defaultValue={[50]} showValue />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('51')).toBeInTheDocument();
  });

  it('increments with ArrowRight and fires onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Slider label="Volume" defaultValue={[50]} onValueChange={onValueChange} />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenCalledWith([51]);
  });

  it('respects the step prop for keyboard increments', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Slider label="Price" step={5} defaultValue={[50]} onValueChange={onValueChange} />,
    );
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenCalledWith([55]);
  });

  it('jumps to min with Home and max with End', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Slider
        label="Price"
        min={10}
        max={90}
        defaultValue={[50]}
        onValueChange={onValueChange}
      />,
    );
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{Home}');
    expect(onValueChange).toHaveBeenCalledWith([10]);
    await user.keyboard('{End}');
    expect(onValueChange).toHaveBeenCalledWith([90]);
  });

  it('fires onValueCommit when a keyboard interaction ends', async () => {
    const user = userEvent.setup();
    const onValueCommit = vi.fn();
    render(<Slider label="Volume" defaultValue={[50]} onValueCommit={onValueCommit} />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(onValueCommit).toHaveBeenCalledWith([51]);
  });

  it('supports controlled value', () => {
    render(<Slider label="Volume" value={[42]} onValueChange={() => {}} showValue />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '42');
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('does not respond to keyboard when disabled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Slider label="Volume" defaultValue={[50]} disabled onValueChange={onValueChange} />,
    );
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('applies the disabled class', () => {
    render(<Slider label="Volume" defaultValue={[50]} disabled />);
    expect(document.querySelector('.ds-slider--disabled')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Slider label="Volume" defaultValue={[60]} />
        <Slider
          label="Price"
          min={0}
          max={200}
          defaultValue={[25, 80]}
          formatValue={(v) => `$${v}`}
          showValue
        />
        <Slider label="Disabled" defaultValue={[30]} disabled />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
