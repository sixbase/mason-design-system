import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { ColorPicker } from './ColorPicker';

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

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ColorPicker options={options} value="carbon-black" aria-label="Finish" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
