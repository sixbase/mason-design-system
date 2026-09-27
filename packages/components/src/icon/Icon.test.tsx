import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Icon } from './Icon';
import { Heart } from './icons';

/* Sample SVG content for testing */
const HeartPath = () => (
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
);

describe('Icon', () => {
  /* ─── Render ─────────────────────────────────────── */

  it('renders with children', () => {
    render(
      <Icon data-testid="icon">
        <HeartPath />
      </Icon>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders an svg element', () => {
    render(
      <Icon data-testid="icon">
        <HeartPath />
      </Icon>,
    );
    expect(screen.getByTestId('icon').tagName).toBe('svg');
  });

  it('renders nothing when no children provided', () => {
    const { container } = render(<Icon />);
    expect(container.firstChild).toBeNull();
  });

  /* ─── Size variants ──────────────────────────────── */

  it('applies default size class (md)', () => {
    render(
      <Icon data-testid="icon">
        <HeartPath />
      </Icon>,
    );
    expect(screen.getByTestId('icon')).toHaveClass('ds-icon--md');
  });

  it('applies sm size class', () => {
    render(
      <Icon size="sm" data-testid="icon">
        <HeartPath />
      </Icon>,
    );
    expect(screen.getByTestId('icon')).toHaveClass('ds-icon--sm');
  });

  it('applies lg size class', () => {
    render(
      <Icon size="lg" data-testid="icon">
        <HeartPath />
      </Icon>,
    );
    expect(screen.getByTestId('icon')).toHaveClass('ds-icon--lg');
  });

  /* ─── Class assembly ─────────────────────────────── */

  it('merges custom className', () => {
    render(
      <Icon className="custom" data-testid="icon">
        <HeartPath />
      </Icon>,
    );
    const el = screen.getByTestId('icon');
    expect(el).toHaveClass('ds-icon');
    expect(el).toHaveClass('custom');
  });

  it('passes through SVG attributes', () => {
    render(
      <Icon data-testid="icon" strokeWidth={2}>
        <HeartPath />
      </Icon>,
    );
    expect(screen.getByTestId('icon')).toHaveAttribute('stroke-width', '2');
  });

  /* ─── Accessibility: decorative (default) ────────── */

  it('is decorative by default (aria-hidden)', () => {
    render(
      <Icon data-testid="icon">
        <HeartPath />
      </Icon>,
    );
    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not have role="img" when decorative', () => {
    render(
      <Icon data-testid="icon">
        <HeartPath />
      </Icon>,
    );
    expect(screen.getByTestId('icon')).not.toHaveAttribute('role');
  });

  /* ─── Accessibility: labelled ────────────────────── */

  it('applies role="img" and aria-label when not decorative', () => {
    render(
      <Icon decorative={false} label="Favorite" data-testid="icon">
        <HeartPath />
      </Icon>,
    );
    const el = screen.getByTestId('icon');
    expect(el).toHaveAttribute('role', 'img');
    expect(el).toHaveAttribute('aria-label', 'Favorite');
  });

  it('is not aria-hidden when not decorative', () => {
    render(
      <Icon decorative={false} label="Favorite" data-testid="icon">
        <HeartPath />
      </Icon>,
    );
    expect(screen.getByTestId('icon')).not.toHaveAttribute('aria-hidden');
  });

  /* ─── Ref forwarding ─────────────────────────────── */

  it('forwards ref to svg element', () => {
    const ref = { current: null as SVGSVGElement | null };
    render(
      <Icon ref={ref}>
        <HeartPath />
      </Icon>,
    );
    expect(ref.current).toBeInstanceOf(SVGSVGElement);
  });

  /* ─── Accessibility audit ────────────────────────── */

  // Regression: `label` without decorative={false} rendered aria-hidden
  // and the label was silently dropped.
  it('treats a labelled Icon as meaningful by default', () => {
    render(<Icon label="Favorite"><HeartPath /></Icon>);
    expect(screen.getByRole('img', { name: 'Favorite' })).toBeInTheDocument();
  });

  it('treats a labelled registry icon as meaningful by default', () => {
    render(<Heart label="Favorite" />);
    expect(screen.getByRole('img', { name: 'Favorite' })).toBeInTheDocument();
  });

  it('lets an explicit decorative override a label', () => {
    const { container } = render(<Heart label="Favorite" decorative />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('has no accessibility violations (decorative)', async () => {
    const { container } = render(
      <div>
        <Icon>
          <HeartPath />
        </Icon>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations (labelled)', async () => {
    const { container } = render(
      <div>
        <Icon decorative={false} label="Favorite">
          <HeartPath />
        </Icon>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
