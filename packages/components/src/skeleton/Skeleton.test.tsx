import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  /* ─── Rendering ────────────────────────────────────────────── */

  it('renders without crashing', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild!.nodeName).toBe('DIV');
  });

  it('applies rectangular variant class by default', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('ds-skeleton--rectangular');
  });

  /* ─── Variants ─────────────────────────────────────────────── */

  it('applies text variant class', () => {
    const { container } = render(<Skeleton variant="text" />);
    expect(container.firstChild).toHaveClass('ds-skeleton--text');
  });

  it('applies circular variant class', () => {
    const { container } = render(<Skeleton variant="circular" />);
    expect(container.firstChild).toHaveClass('ds-skeleton--circular');
  });

  /* ─── Dimensions ───────────────────────────────────────────── */

  it('applies numeric width and height as px', () => {
    const { container } = render(<Skeleton width={200} height={100} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('100px');
  });

  it('applies string width and height as-is', () => {
    const { container } = render(<Skeleton width="50%" height="10rem" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('50%');
    expect(el.style.height).toBe('10rem');
  });

  it('accepts design token references for width and height', () => {
    const { container } = render(
      <Skeleton variant="circular" width="var(--spacing-12)" height="var(--spacing-12)" />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('var(--spacing-12)');
    expect(el.style.height).toBe('var(--spacing-12)');
  });

  /* ─── Text lines ───────────────────────────────────────────── */

  it('renders multiple text lines as a group', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass('ds-skeleton-group');
    expect(group.children).toHaveLength(3);
  });

  it('marks last text line with shorter class', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const group = container.firstChild as HTMLElement;
    const lastChild = group.children[2] as HTMLElement;
    expect(lastChild).toHaveClass('ds-skeleton--text-last');
  });

  it('renders single text line without group wrapper', () => {
    const { container } = render(<Skeleton variant="text" lines={1} />);
    expect(container.firstChild).toHaveClass('ds-skeleton--text');
    expect(container.firstChild).not.toHaveClass('ds-skeleton-group');
  });

  /* ─── Animation control ────────────────────────────────────── */

  it('applies static class when animate is false', () => {
    const { container } = render(<Skeleton animate={false} />);
    expect(container.firstChild).toHaveClass('ds-skeleton--static');
  });

  it('does not apply static class when animate is true', () => {
    const { container } = render(<Skeleton animate={true} />);
    expect(container.firstChild).not.toHaveClass('ds-skeleton--static');
  });

  /* ─── HTML attributes ──────────────────────────────────────── */

  it('merges custom className', () => {
    const { container } = render(<Skeleton className="custom" />);
    expect(container.firstChild).toHaveClass('ds-skeleton', 'custom');
  });

  it('passes through HTML attributes', () => {
    render(<Skeleton data-testid="skel" />);
    expect(screen.getByTestId('skel')).toBeInTheDocument();
  });

  it('is always aria-hidden', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('text group is aria-hidden', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  /* ─── Accessibility ────────────────────────────────────────── */

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div role="status" aria-busy="true" aria-label="Loading">
        <Skeleton variant="rectangular" width={300} height={200} />
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton variant="text" lines={3} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
