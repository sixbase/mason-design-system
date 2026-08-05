import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Carousel, CarouselSlide } from './Carousel';

/** jsdom does not implement Element scrolling — stub scrollBy to observe calls. */
const scrollBySpy = vi.fn();

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
    writable: true,
    configurable: true,
    value: scrollBySpy,
  });
  mockMatchMedia(false);
});

afterEach(() => {
  scrollBySpy.mockClear();
});

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

  describe('carousel a11y semantics', () => {
    it('exposes a labelled region with aria-roledescription carousel', () => {
      render(
        <Carousel label="Featured products">
          <CarouselSlide>Slide</CarouselSlide>
        </Carousel>,
      );
      const region = screen.getByRole('region', { name: 'Featured products' });
      expect(region).toHaveAttribute('aria-roledescription', 'carousel');
    });

    it('labels each slide as "N of M"', () => {
      render(
        <Carousel label="Featured products">
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
          <CarouselSlide>Three</CarouselSlide>
        </Carousel>,
      );
      const slide = screen.getByRole('group', { name: '2 of 3' });
      expect(slide).toHaveAttribute('aria-roledescription', 'slide');
    });

    it('renders standalone slides without a positional label', () => {
      render(<CarouselSlide data-testid="slide">Slide</CarouselSlide>);
      expect(screen.getByTestId('slide')).not.toHaveAttribute('aria-label');
    });
  });

  describe('controls', () => {
    it('renders no controls or indicators by default', () => {
      render(
        <Carousel label="Featured products">
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
        </Carousel>,
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders prev/next buttons when controls is set', () => {
      render(
        <Carousel controls label="Featured products">
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
        </Carousel>,
      );
      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
    });

    it('disables the previous button at the start', () => {
      render(
        <Carousel controls label="Featured products">
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
        </Carousel>,
      );
      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
    });

    it('keeps both buttons enabled at the ends when loop is set', () => {
      render(
        <Carousel controls loop label="Featured products">
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
        </Carousel>,
      );
      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeEnabled();
    });

    it('scrolls the track by one slide on next click', async () => {
      render(
        <Carousel controls label="Featured products">
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
        </Carousel>,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Next slide' }));
      expect(scrollBySpy).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'smooth' }),
      );
      // After moving off the first slide, previous becomes available.
      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeEnabled();
    });

    it('uses instant scrolling under prefers-reduced-motion', async () => {
      mockMatchMedia(true);
      render(
        <Carousel controls label="Featured products">
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
        </Carousel>,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Next slide' }));
      expect(scrollBySpy).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'auto' }),
      );
    });
  });

  describe('indicators', () => {
    it('renders one dot per slide when indicators is set', () => {
      render(
        <Carousel indicators label="Featured products">
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
          <CarouselSlide>Three</CarouselSlide>
        </Carousel>,
      );
      expect(screen.getByRole('button', { name: 'Go to slide 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to slide 3' })).toBeInTheDocument();
    });

    it('marks the active dot with aria-current', async () => {
      render(
        <Carousel indicators label="Featured products">
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
        </Carousel>,
      );
      expect(screen.getByRole('button', { name: 'Go to slide 1' })).toHaveAttribute(
        'aria-current',
        'true',
      );
      await userEvent.click(screen.getByRole('button', { name: 'Go to slide 2' }));
      expect(scrollBySpy).toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute(
        'aria-current',
        'true',
      );
    });
  });

  describe('keyboard navigation', () => {
    it('makes the scroll track focusable', () => {
      const { container } = render(
        <Carousel label="Featured products">
          <CarouselSlide>One</CarouselSlide>
        </Carousel>,
      );
      expect(container.querySelector('.ds-carousel__track')).toHaveAttribute('tabindex', '0');
    });

    it('scrolls by one slide with arrow keys when the track has focus', async () => {
      const { container } = render(
        <Carousel label="Featured products">
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
        </Carousel>,
      );
      const track = container.querySelector<HTMLElement>('.ds-carousel__track')!;
      track.focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(scrollBySpy).toHaveBeenCalledTimes(1);
      await userEvent.keyboard('{ArrowLeft}');
      expect(scrollBySpy).toHaveBeenCalledTimes(2);
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Carousel label="Featured products">
        <CarouselSlide>No. 8 Cast Iron Skillet</CarouselSlide>
        <CarouselSlide>Walnut Cutting Board</CarouselSlide>
        <CarouselSlide>Enameled Dutch Oven</CarouselSlide>
      </Carousel>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations with controls and indicators', async () => {
    const { container } = render(
      <Carousel controls indicators label="Featured products">
        <CarouselSlide>No. 8 Cast Iron Skillet</CarouselSlide>
        <CarouselSlide>Walnut Cutting Board</CarouselSlide>
        <CarouselSlide>Enameled Dutch Oven</CarouselSlide>
      </Carousel>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
