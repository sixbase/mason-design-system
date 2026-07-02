import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Carousel, CarouselSlide } from './Carousel';

describe('Carousel', () => {
  it('renders slide content', () => {
    render(
      <Carousel>
        <CarouselSlide>Slide one</CarouselSlide>
        <CarouselSlide>Slide two</CarouselSlide>
      </Carousel>,
    );
    expect(screen.getByText('Slide one')).toBeInTheDocument();
    expect(screen.getByText('Slide two')).toBeInTheDocument();
  });

  it('applies default gap class', () => {
    const { container } = render(
      <Carousel>
        <CarouselSlide>Slide</CarouselSlide>
      </Carousel>,
    );
    expect(container.querySelector('.ds-carousel--gap-md')).toBeInTheDocument();
  });

  it('applies gap class', () => {
    const { container } = render(
      <Carousel gap="lg">
        <CarouselSlide>Slide</CarouselSlide>
      </Carousel>,
    );
    expect(container.querySelector('.ds-carousel--gap-lg')).toBeInTheDocument();
  });

  it('renders slides inside a scroll track', () => {
    const { container } = render(
      <Carousel>
        <CarouselSlide>Slide</CarouselSlide>
      </Carousel>,
    );
    const track = container.querySelector('.ds-carousel__track');
    expect(track).toBeInTheDocument();
    expect(track!.querySelector('.ds-carousel__slide')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(
      <Carousel className="custom">
        <CarouselSlide>Slide</CarouselSlide>
      </Carousel>,
    );
    expect(container.querySelector('.ds-carousel')).toHaveClass('custom');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(
      <Carousel ref={ref}>
        <CarouselSlide>Slide</CarouselSlide>
      </Carousel>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('applies default slide size class', () => {
    render(<CarouselSlide data-testid="slide">Slide</CarouselSlide>);
    expect(screen.getByTestId('slide')).toHaveClass('ds-carousel__slide--md');
  });

  it('applies slide size class', () => {
    render(
      <CarouselSlide size="sm" data-testid="slide">
        Slide
      </CarouselSlide>,
    );
    expect(screen.getByTestId('slide')).toHaveClass('ds-carousel__slide--sm');
  });

  it('passes through html attributes', () => {
    render(
      <Carousel aria-label="Featured products" data-testid="carousel">
        <CarouselSlide>Slide</CarouselSlide>
      </Carousel>,
    );
    expect(screen.getByTestId('carousel')).toHaveAttribute('aria-label', 'Featured products');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Carousel aria-label="Featured products">
        <CarouselSlide>No. 8 Cast Iron Skillet</CarouselSlide>
        <CarouselSlide>Walnut Cutting Board</CarouselSlide>
        <CarouselSlide>Enameled Dutch Oven</CarouselSlide>
      </Carousel>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
