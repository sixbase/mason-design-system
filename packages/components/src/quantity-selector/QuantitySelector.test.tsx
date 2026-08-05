import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { QuantitySelector } from './QuantitySelector';

describe('QuantitySelector', () => {
  it('renders current value in an editable spinbutton', () => {
    render(<QuantitySelector value={3} onChange={() => {}} />);
    expect(screen.getByRole('spinbutton')).toHaveValue('3');
  });

  it('increments value on plus click', async () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={1} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Increase quantity'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('decrements value on minus click', async () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={3} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Decrease quantity'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables decrement at min', () => {
    render(<QuantitySelector value={1} onChange={() => {}} min={1} />);
    expect(screen.getByLabelText('Decrease quantity')).toBeDisabled();
  });

  it('disables increment at max', () => {
    render(<QuantitySelector value={10} onChange={() => {}} max={10} />);
    expect(screen.getByLabelText('Increase quantity')).toBeDisabled();
  });

  it('respects step', async () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={2} onChange={onChange} step={5} max={99} />);
    await userEvent.click(screen.getByLabelText('Increase quantity'));
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it('clamps to max when step overshoots', async () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={8} onChange={onChange} step={5} max={10} />);
    await userEvent.click(screen.getByLabelText('Increase quantity'));
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('disables both buttons and the input when disabled', () => {
    render(<QuantitySelector value={5} onChange={() => {}} disabled />);
    expect(screen.getByLabelText('Decrease quantity')).toBeDisabled();
    expect(screen.getByLabelText('Increase quantity')).toBeDisabled();
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  it('renders group with aria-label', () => {
    render(<QuantitySelector value={1} onChange={() => {}} aria-label="Item quantity" />);
    expect(screen.getByRole('group', { name: 'Item quantity' })).toBeInTheDocument();
  });

  describe('spinbutton semantics', () => {
    it('exposes aria-valuenow, aria-valuemin, and aria-valuemax', () => {
      render(<QuantitySelector value={4} onChange={() => {}} min={2} max={8} />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('aria-valuenow', '4');
      expect(input).toHaveAttribute('aria-valuemin', '2');
      expect(input).toHaveAttribute('aria-valuemax', '8');
    });

    it('uses a numeric input mode', () => {
      render(<QuantitySelector value={1} onChange={() => {}} />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('inputmode', 'numeric');
    });

    it('removes +/- buttons from the tab order (APG spinbutton pattern)', () => {
      render(<QuantitySelector value={2} onChange={() => {}} />);
      expect(screen.getByLabelText('Decrease quantity')).toHaveAttribute('tabindex', '-1');
      expect(screen.getByLabelText('Increase quantity')).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('typed entry', () => {
    it('commits a typed value on blur', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={1} onChange={onChange} max={99} />);
      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '7');
      await user.tab();
      expect(onChange).toHaveBeenCalledWith(7);
    });

    it('commits a typed value on Enter', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={1} onChange={onChange} max={99} />);
      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '12{Enter}');
      expect(onChange).toHaveBeenCalledWith(12);
    });

    it('clamps typed values above max', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={1} onChange={onChange} min={1} max={10} />);
      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '500{Enter}');
      expect(onChange).toHaveBeenCalledWith(10);
    });

    it('clamps typed values below min', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={5} onChange={onChange} min={2} max={10} />);
      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '0{Enter}');
      expect(onChange).toHaveBeenCalledWith(2);
    });

    it('reverts to the current value when the field is left empty', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={5} onChange={onChange} />);
      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.tab();
      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('5');
    });

    it('ignores non-numeric characters while typing', async () => {
      const user = userEvent.setup();
      render(<QuantitySelector value={1} onChange={() => {}} />);
      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, 'a-2b');
      expect(input).toHaveValue('2');
    });
  });

  describe('keyboard stepping', () => {
    it('ArrowUp increments by step', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={3} onChange={onChange} step={2} />);
      screen.getByRole('spinbutton').focus();
      await user.keyboard('{ArrowUp}');
      expect(onChange).toHaveBeenCalledWith(5);
    });

    it('ArrowDown decrements by step and clamps at min', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={2} onChange={onChange} min={1} step={5} />);
      screen.getByRole('spinbutton').focus();
      await user.keyboard('{ArrowDown}');
      expect(onChange).toHaveBeenCalledWith(1);
    });

    it('Home jumps to min and End jumps to max', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={5} onChange={onChange} min={1} max={9} />);
      screen.getByRole('spinbutton').focus();
      await user.keyboard('{Home}');
      expect(onChange).toHaveBeenCalledWith(1);
      await user.keyboard('{End}');
      expect(onChange).toHaveBeenCalledWith(9);
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<QuantitySelector value={1} onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
