import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with role status', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has a default accessible label of "Loading"', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });

  it('uses a custom label', () => {
    render(<Spinner label="Loading products" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading products');
  });

  it('hides the label visually by default', () => {
    render(<Spinner />);
    expect(document.querySelector('.ds-spinner__sr-only')).toHaveTextContent('Loading');
    expect(document.querySelector('.ds-spinner__label')).not.toBeInTheDocument();
  });

  it('shows the label as visible text when showLabel is set', () => {
    render(<Spinner label="Loading products" showLabel />);
    expect(document.querySelector('.ds-spinner__label')).toHaveTextContent('Loading products');
    expect(document.querySelector('.ds-spinner__sr-only')).not.toBeInTheDocument();
  });

  it('hides the circle from assistive technology', () => {
    render(<Spinner />);
    expect(document.querySelector('.ds-spinner__circle')).toHaveAttribute('aria-hidden', 'true');
    // Opted out of the global reduced-motion reset, which froze the pulse
    expect(document.querySelector('.ds-spinner__circle')).toHaveClass('ds-motion-safe');
  });

  it('applies md size by default', () => {
    render(<Spinner />);
    expect(document.querySelector('.ds-spinner--md')).toBeInTheDocument();
  });

  it.each(['sm', 'md', 'lg'] as const)('applies size class for %s', (size) => {
    render(<Spinner size={size} />);
    expect(document.querySelector(`.ds-spinner--${size}`)).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<Spinner className="custom" />);
    expect(screen.getByRole('status')).toHaveClass('ds-spinner', 'custom');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Spinner />
        <Spinner size="sm" label="Checking availability" />
        <Spinner size="lg" label="Loading products" showLabel />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
