import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Grid } from './Grid';

/** Loads a component stylesheet into jsdom (no @media support) for computed-style checks. */
function injectCss(file: string): () => void {
  const style = document.createElement('style');
  style.textContent = readFileSync(resolve(__dirname, file), 'utf8');
  document.head.appendChild(style);
  return () => style.remove();
}

describe('Grid', () => {
  it('renders children', () => {
    render(<Grid><div>Item</div></Grid>);
    expect(screen.getByText('Item')).toBeInTheDocument();
  });

  it('applies base class', () => {
    const { container } = render(<Grid>Content</Grid>);
    expect(container.firstChild).toHaveClass('ds-grid');
  });

  it('sets column CSS variables when props provided', () => {
    const { container } = render(
      <Grid cols={2} colsSm={3} colsMd={4} colsLg={5}>Content</Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue('--grid-cols')).toBe('2');
    expect(el.style.getPropertyValue('--grid-cols-sm')).toBe('3');
    expect(el.style.getPropertyValue('--grid-cols-md')).toBe('4');
    expect(el.style.getPropertyValue('--grid-cols-lg')).toBe('5');
  });

  it('does not set CSS variables when using defaults', () => {
    const { container } = render(<Grid>Content</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue('--grid-cols')).toBe('');
  });

  it('sets gap CSS variable when provided', () => {
    const { container } = render(<Grid gap={8}>Content</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue('--grid-gap')).toBe('var(--spacing-8)');
  });

  it('sets per-axis gap CSS variables when provided', () => {
    const { container } = render(<Grid rowGap={2} columnGap={6}>Content</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue('--grid-row-gap')).toBe('var(--spacing-2)');
    expect(el.style.getPropertyValue('--grid-column-gap')).toBe('var(--spacing-6)');
  });

  it('applies alignment modifier classes', () => {
    const { container } = render(
      <Grid alignItems="center" justifyItems="start">Content</Grid>,
    );
    expect(container.firstChild).toHaveClass('ds-grid--align-center', 'ds-grid--justify-start');
  });

  it('does not apply alignment classes by default', () => {
    const { container } = render(<Grid>Content</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toBe('ds-grid');
  });

  it('enables auto-fit mode when minChildWidth is set', () => {
    const { container } = render(
      <Grid minChildWidth="var(--size-content-sm)">Content</Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('ds-grid--auto-fit');
    expect(el.style.getPropertyValue('--grid-min-child')).toBe('var(--size-content-sm)');
  });

  it('does not enable auto-fit mode by default', () => {
    const { container } = render(<Grid cols={2}>Content</Grid>);
    expect(container.firstChild).not.toHaveClass('ds-grid--auto-fit');
  });

  it('merges custom className', () => {
    const { container } = render(<Grid className="custom">Content</Grid>);
    expect(container.firstChild).toHaveClass('ds-grid', 'custom');
  });

  it('merges custom style', () => {
    const { container } = render(
      <Grid style={{ color: 'red' }} cols={2}>Content</Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.color).toBe('red');
    expect(el.style.getPropertyValue('--grid-cols')).toBe('2');
  });

  // Regression: bare 1fr tracks (= minmax(auto, 1fr)) let one child with
  // long unbroken content widen its column and push the grid past its
  // container at 320px.
  it('uses zero-minimum tracks so content cannot blow out columns', () => {
    const removeCss = injectCss('Grid.css');
    render(<Grid data-testid="grid"><div>https://example.com/a-very-long-unbroken-url</div></Grid>);
    expect(getComputedStyle(screen.getByTestId('grid')).gridTemplateColumns).toContain('minmax(0, 1fr)');
    removeCss();
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Grid ref={ref}>Content</Grid>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes through html attributes', () => {
    render(<Grid data-testid="grid-el">Content</Grid>);
    expect(screen.getByTestId('grid-el')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Grid cols={2}>
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
