import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { ColorPicker } from './ColorPicker';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const options = [
  { color: '#26241F', label: 'Carbon Black', value: 'carbon-black' },
  { color: '#B08D57', label: 'Brushed Brass', value: 'brushed-brass' },
  { color: '#F5F2EC', label: 'Matte White', value: 'matte-white' },
];

describe('ColorPicker', () => {
  it('renders a radiogroup', () => {
    render(<ColorPicker options={options} aria-label="Finish" />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders one radio per option', () => {
    render(<ColorPicker options={options} aria-label="Finish" />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('labels each swatch with its color name', () => {
    render(<ColorPicker options={options} aria-label="Finish" />);
    expect(screen.getByLabelText('Carbon Black')).toBeInTheDocument();
    expect(screen.getByLabelText('Brushed Brass')).toBeInTheDocument();
  });

  it('marks the selected option as checked', () => {
    render(<ColorPicker options={options} value="brushed-brass" aria-label="Finish" />);
    expect(screen.getByLabelText('Brushed Brass')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText('Carbon Black')).toHaveAttribute('aria-checked', 'false');
  });

  it('applies active class to the selected swatch', () => {
    render(<ColorPicker options={options} value="carbon-black" aria-label="Finish" />);
    expect(screen.getByLabelText('Carbon Black')).toHaveClass('ds-color-picker__btn--active');
  });

  it('calls onChange with the option value when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker options={options} onChange={onChange} aria-label="Finish" />);
    await user.click(screen.getByLabelText('Matte White'));
    expect(onChange).toHaveBeenCalledWith('matte-white');
  });

  it('applies default size class', () => {
    const { container } = render(<ColorPicker options={options} aria-label="Finish" />);
    expect(container.querySelector('.ds-color-picker--md')).toBeInTheDocument();
  });

  it('applies size class', () => {
    const { container } = render(<ColorPicker options={options} size="lg" aria-label="Finish" />);
    expect(container.querySelector('.ds-color-picker--lg')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<ColorPicker options={options} className="custom" data-testid="picker" aria-label="Finish" />);
    expect(screen.getByTestId('picker')).toHaveClass('custom');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<ColorPicker ref={ref} options={options} aria-label="Finish" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  describe('roving tabindex', () => {
    it('makes the selected swatch the only tab stop', () => {
      render(<ColorPicker options={options} value="brushed-brass" aria-label="Finish" />);
      expect(screen.getByLabelText('Brushed Brass')).toHaveAttribute('tabindex', '0');
      expect(screen.getByLabelText('Carbon Black')).toHaveAttribute('tabindex', '-1');
      expect(screen.getByLabelText('Matte White')).toHaveAttribute('tabindex', '-1');
    });

    it('falls back to the first swatch when nothing is selected', () => {
      render(<ColorPicker options={options} aria-label="Finish" />);
      expect(screen.getByLabelText('Carbon Black')).toHaveAttribute('tabindex', '0');
      expect(screen.getByLabelText('Brushed Brass')).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('arrow-key navigation', () => {
    it('ArrowRight selects and focuses the next swatch', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ColorPicker options={options} value="carbon-black" onChange={onChange} aria-label="Finish" />,
      );
      screen.getByLabelText('Carbon Black').focus();
      await user.keyboard('{ArrowRight}');
      expect(onChange).toHaveBeenCalledWith('brushed-brass');
      expect(screen.getByLabelText('Brushed Brass')).toHaveFocus();
    });

    it('ArrowDown behaves like ArrowRight', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ColorPicker options={options} value="carbon-black" onChange={onChange} aria-label="Finish" />,
      );
      screen.getByLabelText('Carbon Black').focus();
      await user.keyboard('{ArrowDown}');
      expect(onChange).toHaveBeenCalledWith('brushed-brass');
    });

    it('ArrowLeft selects and focuses the previous swatch', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ColorPicker options={options} value="brushed-brass" onChange={onChange} aria-label="Finish" />,
      );
      screen.getByLabelText('Brushed Brass').focus();
      await user.keyboard('{ArrowLeft}');
      expect(onChange).toHaveBeenCalledWith('carbon-black');
      expect(screen.getByLabelText('Carbon Black')).toHaveFocus();
    });

    it('wraps from the last swatch to the first', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ColorPicker options={options} value="matte-white" onChange={onChange} aria-label="Finish" />,
      );
      screen.getByLabelText('Matte White').focus();
      await user.keyboard('{ArrowRight}');
      expect(onChange).toHaveBeenCalledWith('carbon-black');
      expect(screen.getByLabelText('Carbon Black')).toHaveFocus();
    });

    it('wraps from the first swatch to the last', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ColorPicker options={options} value="carbon-black" onChange={onChange} aria-label="Finish" />,
      );
      screen.getByLabelText('Carbon Black').focus();
      await user.keyboard('{ArrowUp}');
      expect(onChange).toHaveBeenCalledWith('matte-white');
    });
  });

  describe('showLabel', () => {
    it('displays the selected option name next to the group', () => {
      render(
        <ColorPicker options={options} value="brushed-brass" showLabel aria-label="Finish" />,
      );
      expect(screen.getByText('Brushed Brass')).toBeInTheDocument();
    });

    it('does not render a label text when nothing is selected', () => {
      const { container } = render(
        <ColorPicker options={options} showLabel aria-label="Finish" />,
      );
      expect(container.querySelector('.ds-color-picker-label')).not.toBeInTheDocument();
    });

    it('does not render label text by default', () => {
      const { container } = render(
        <ColorPicker options={options} value="brushed-brass" aria-label="Finish" />,
      );
      expect(container.querySelector('.ds-color-picker-label')).not.toBeInTheDocument();
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ColorPicker options={options} value="carbon-black" aria-label="Finish" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations with showLabel', async () => {
    const { container } = render(
      <ColorPicker options={options} value="carbon-black" showLabel aria-label="Finish" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });


  // ─── Regressions (QA break pass) ─────────────────────────

  describe('regressions', () => {
    it('a one-swatch group does not report a change when arrows wrap onto itself', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ColorPicker
          aria-label="Color"
          options={[{ color: '#000', label: 'Black', value: 'black' }]}
          value="black"
          onChange={onChange}
        />,
      );
      screen.getByRole('radio').focus();
      await user.keyboard('{ArrowRight}');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('ArrowRight moves to the visually-next swatch in RTL', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <div dir="rtl">
          <ColorPicker
            aria-label="Color"
            value="b"
            onChange={onChange}
            options={[
              { color: '#000', label: 'A', value: 'a' },
              { color: '#fff', label: 'B', value: 'b' },
              { color: '#f00', label: 'C', value: 'c' },
            ]}
          />
        </div>,
      );
      screen.getByRole('radio', { name: 'B' }).focus();
      await user.keyboard('{ArrowRight}');
      expect(onChange).toHaveBeenCalledWith('a');
    });

    it('swatches wrap instead of overflowing a phone-width container', () => {
      const style = document.createElement('style');
      style.textContent = readFileSync(resolve(__dirname, 'ColorPicker.css'), 'utf8');
      document.head.appendChild(style);
      try {
        render(<ColorPicker aria-label="Color" options={[{ color: '#000', label: 'A', value: 'a' }]} />);
        expect(getComputedStyle(screen.getByRole('radiogroup')).flexWrap).toBe('wrap');
      } finally {
        style.remove();
      }
    });
  });
});
