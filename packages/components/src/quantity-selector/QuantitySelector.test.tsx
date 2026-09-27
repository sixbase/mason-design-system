import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { QuantitySelector } from './QuantitySelector';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { useState } from 'react';

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


  // ─── Regressions (QA break pass) ─────────────────────────

  describe('regressions', () => {
    function Harness() {
      const [value, setValue] = useState(1);
      return <QuantitySelector value={value} onChange={setValue} />;
    }

    // Safari never focuses a clicked button, so the input never blurred and
    // "+" stepped from the stale prop while the field kept the typed number.
    it('+ steps from a pending typed draft even if the input never blurs', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      const input = screen.getByRole('spinbutton');
      await user.click(input);
      await user.clear(input);
      await user.type(input, '5');
      fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
      expect(input).toHaveValue('6');
      expect(input).toHaveAttribute('aria-valuenow', '6');
    });

    it('decrement from an out-of-range value lands inside the range', () => {
      const onChange = vi.fn();
      render(<QuantitySelector value={150} onChange={onChange} max={99} />);
      fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));
      expect(onChange).toHaveBeenCalledWith(99);
    });

    // Bad cart data: Math.max(min, NaN) is NaN, so "+" sent onChange(NaN)
    // and the field read "NaN".
    it('a NaN value never reaches onChange or the screen', () => {
      const onChange = vi.fn();
      render(<QuantitySelector value={Number.NaN} onChange={onChange} />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue('');
      expect(input).not.toHaveAttribute('aria-valuenow');
      fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
      expect(onChange).toHaveBeenCalledWith(1);
    });

    // Stripping non-digits alone turned "2.5" into 25 and "1e9" into 19.
    it.each([
      ['2.5', 2],
      ['1e9', 1],
      ['3,5', 3],
      [' 7 ', 7],
      ['-5', 5],
    ])('pasted %j commits %i', (pasted, expected) => {
      const onChange = vi.fn();
      render(<QuantitySelector value={10} onChange={onChange} />);
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: pasted } });
      fireEvent.blur(input);
      expect(onChange).toHaveBeenCalledWith(expected);
    });

    // overflow: hidden clipped the buttons' 44px coarse-pointer hit areas.
    it('the frame does not clip the coarse-pointer hit areas', () => {
      const style = document.createElement('style');
      style.textContent = readFileSync(resolve(__dirname, 'QuantitySelector.css'), 'utf8');
      document.head.appendChild(style);
      try {
        const { container } = render(<QuantitySelector value={1} onChange={() => {}} size="sm" />);
        expect(getComputedStyle(container.firstElementChild!).overflow).not.toBe('hidden');
      } finally {
        style.remove();
      }
    });
  });
});
