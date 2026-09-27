import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Card, CardBody, CardFooter, CardImage } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders as a div', () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card').tagName).toBe('DIV');
  });

  it('applies elevated variant by default', () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('ds-card--elevated');
  });

  it('applies outlined variant', () => {
    render(<Card variant="outlined" data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('ds-card--outlined');
  });

  it('applies interactive class', () => {
    render(<Card interactive data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('ds-card--interactive');
  });

  it('applies ghost variant', () => {
    render(<Card variant="ghost" data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('ds-card--ghost');
  });

  it('applies the no-padding modifier only when noPadding is set', () => {
    const { rerender } = render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).not.toHaveClass('ds-card--no-padding');
    rerender(<Card noPadding data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('ds-card--no-padding');
  });

  it('merges a consumer className and forwards the ref to the root', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Card ref={ref} className="promo" data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('ds-card', 'promo');
    expect(ref.current).toBe(card);
  });

  it('renders CardBody', () => {
    render(<Card><CardBody>Body content</CardBody></Card>);
    expect(screen.getByText('Body content')).toHaveClass('ds-card-body');
  });

  it('renders CardFooter', () => {
    render(<Card><CardFooter>Footer content</CardFooter></Card>);
    expect(screen.getByText('Footer content')).toHaveClass('ds-card-footer');
  });

  it('renders CardImage with alt text', () => {
    render(<CardImage src="/image.jpg" alt="Product photo" />);
    expect(screen.getByAltText('Product photo')).toBeInTheDocument();
  });

  it('uses the aspect token default when no aspectRatio is passed', () => {
    const { container } = render(<CardImage src="/image.jpg" alt="Product photo" />);
    const wrapper = container.querySelector('.ds-card-image') as HTMLElement;
    // No inline override — CSS falls back to var(--aspect-landscape) (4/3).
    expect(wrapper.style.getPropertyValue('--card-image-ratio')).toBe('');
  });

  it('sets the component token when aspectRatio is passed', () => {
    const { container } = render(
      <CardImage src="/image.jpg" alt="Product photo" aspectRatio="1/1" />,
    );
    const wrapper = container.querySelector('.ds-card-image') as HTMLElement;
    expect(wrapper.style.getPropertyValue('--card-image-ratio')).toBe('1/1');
  });

  // Regression: a consumer `style` replaced the style object and dropped
  // the aspect-ratio token set by the prop.
  it('keeps aspectRatio when a style prop is also passed', () => {
    const { container } = render(
      <CardImage
        src="/image.jpg"
        alt="Product photo"
        aspectRatio="1/1"
        style={{ backgroundColor: 'var(--color-background)' }}
      />,
    );
    const wrapper = container.querySelector('.ds-card-image') as HTMLElement;
    expect(wrapper.style.getPropertyValue('--card-image-ratio')).toBe('1/1');
    expect(wrapper.style.backgroundColor).toBe('var(--color-background)');
  });

  // Regression: no srcset/sizes and a hard-coded loading="lazy" meant no
  // responsive images and a deferred LCP image for above-the-fold cards.
  it('passes srcSet, sizes and loading through to the image', () => {
    const { container } = render(
      <CardImage
        src="/a.jpg"
        alt="Enamel camp mug"
        srcSet="/a-400.jpg 400w, /a-800.jpg 800w"
        sizes="(min-width: 768px) 33vw, 100vw"
        loading="eager"
      />,
    );
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('srcset', '/a-400.jpg 400w, /a-800.jpg 800w');
    expect(img).toHaveAttribute('sizes', '(min-width: 768px) 33vw, 100vw');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Card>
        <CardBody>Card content</CardBody>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
