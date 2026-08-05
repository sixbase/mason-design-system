import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { ColorSwatch } from './ColorSwatch';

describe('ColorSwatch', () => {
  it('renders the token name', () => {
    render(<ColorSwatch color="#26241F" name="--color-stone-900" />);
    expect(screen.getByText('--color-stone-900')).toBeInTheDocument();
  });

  it('renders the value when provided', () => {
    render(<ColorSwatch color="#26241F" name="--color-stone-900" value="#26241F" />);
    expect(screen.getByText('#26241F')).toBeInTheDocument();
  });

  it('does not render a value element when omitted', () => {
    const { container } = render(<ColorSwatch color="#26241F" name="--color-stone-900" />);
    expect(container.querySelector('.ds-color-swatch__value')).not.toBeInTheDocument();
  });

  it('applies the color to the sample', () => {
    const { container } = render(<ColorSwatch color="rgb(38, 36, 31)" name="--color-stone-900" />);
    const sample = container.querySelector('.ds-color-swatch__sample');
    expect(sample).toHaveStyle({ backgroundColor: 'rgb(38, 36, 31)' });
  });

  it('merges custom className', () => {
    render(<ColorSwatch color="#26241F" name="--color-stone-900" className="custom" data-testid="swatch" />);
    expect(screen.getByTestId('swatch')).toHaveClass('custom', 'ds-color-swatch');
  });

  it('passes through html attributes', () => {
    render(<ColorSwatch color="#26241F" name="--color-stone-900" data-testid="swatch-el" />);
    expect(screen.getByTestId('swatch-el')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<ColorSwatch ref={ref} color="#26241F" name="--color-stone-900" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('labels the sample with the token name and resolved value', () => {
    render(<ColorSwatch color="var(--color-stone-900)" name="--color-stone-900" value="#26241F" />);
    expect(
      screen.getByRole('img', { name: '--color-stone-900: #26241F' }),
    ).toBeInTheDocument();
  });

  it('falls back to the color prop in the aria-label when no value is given', () => {
    render(<ColorSwatch color="#26241F" name="--color-stone-900" />);
    expect(
      screen.getByRole('img', { name: '--color-stone-900: #26241F' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <ColorSwatch color="#26241F" name="--color-stone-900" value="#26241F" />
        <ColorSwatch color="#F5F2EC" name="--color-stone-50" value="#F5F2EC" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
