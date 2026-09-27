import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Carousel, CarouselSlide } from './Carousel';

/** jsdom does not implement Element scrolling — stub scrollTo to observe calls. */
const scrollToSpy = vi.fn();

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
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    writable: true,
    configurable: true,
    value: scrollToSpy,
  });
  mockMatchMedia(false);
});

afterEach(() => {
  scrollToSpy.mockClear();
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
      // Pin each label to its slide — an off-by-one ("1 of 3" on the second
      // slide) still produced a "2 of 3" somewhere and passed.
      expect(slide).toHaveTextContent('Two');
      expect(screen.getByRole('group', { name: '1 of 3' })).toHaveTextContent('One');
      expect(screen.getByRole('group', { name: '3 of 3' })).toHaveTextContent('Three');
    });

    it('removes its window resize listener on unmount', () => {
      const add = vi.spyOn(window, 'addEventListener');
      const remove = vi.spyOn(window, 'removeEventListener');
      const { unmount } = render(
        <Carousel label="Featured products">
          <CarouselSlide>One</CarouselSlide>
        </Carousel>,
      );
      const added = add.mock.calls.filter(([type]) => type === 'resize').map(([, fn]) => fn);
      expect(added.length).toBeGreaterThan(0);
      unmount();
      const removed = remove.mock.calls.filter(([type]) => type === 'resize').map(([, fn]) => fn);
      added.forEach((fn) => expect(removed).toContain(fn));
      add.mockRestore();
      remove.mockRestore();
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

    it('disables the previous button at the start', async () => {
      render(
        <Carousel controls label="Featured products">
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
        </Carousel>,
      );
      const prev = screen.getByRole('button', { name: 'Previous slide' });
      expect(prev).toHaveAttribute('aria-disabled', 'true');
      await userEvent.click(prev);
      expect(scrollToSpy).not.toHaveBeenCalled();
    });

    // Regression (keyboard audit): the ends used native `disabled`, so
    // pressing Next onto the last slide disabled the focused button and
    // focus fell to <body>. The end control must keep focus and do nothing.
    it('keeps focus on Next when it reaches the last slide', async () => {
      render(
        <Carousel controls label="Featured products">
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
        </Carousel>,
      );
      const next = screen.getByRole('button', { name: 'Next slide' });
      next.focus();
      const track = document.querySelector('.ds-carousel__track') as HTMLElement;
      Object.defineProperty(track, 'scrollWidth', { configurable: true, value: 800 });
      Object.defineProperty(track, 'clientWidth', { configurable: true, value: 400 });
      track.scrollLeft = 400;
      fireEvent.scroll(track);
      expect(next).toHaveAttribute('aria-disabled', 'true');
      expect(next).not.toBeDisabled();
      expect(next).toHaveFocus();
      scrollToSpy.mockClear();
      await userEvent.keyboard('{Enter}');
      expect(scrollToSpy).not.toHaveBeenCalled();
    });

    it('keeps both buttons enabled at the ends when loop is set', () => {
      render(
        <Carousel controls loop label="Featured products">
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
        </Carousel>,
      );
      expect(screen.getByRole('button', { name: 'Previous slide' })).toHaveAttribute('aria-disabled', 'false');
      expect(screen.getByRole('button', { name: 'Next slide' })).toHaveAttribute('aria-disabled', 'false');
    });

    it('scrolls the track by one slide on next click', async () => {
      render(
        <Carousel controls label="Featured products">
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
        </Carousel>,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Next slide' }));
      expect(scrollToSpy).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'smooth' }),
      );
      // After moving off the first slide, previous becomes available.
      expect(screen.getByRole('button', { name: 'Previous slide' })).toHaveAttribute('aria-disabled', 'false');
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
      expect(scrollToSpy).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'auto' }),
      );
    });

    it('uses instant scrolling when the page switches motion off (<html data-motion="off">)', async () => {
      document.documentElement.dataset.motion = 'off';
      try {
        render(
          <Carousel controls label="Featured products">
            <CarouselSlide>One</CarouselSlide>
            <CarouselSlide>Two</CarouselSlide>
          </Carousel>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Next slide' }));
        expect(scrollToSpy).toHaveBeenCalledWith(
          expect.objectContaining({ behavior: 'auto' }),
        );
        expect(scrollToSpy).not.toHaveBeenCalledWith(
          expect.objectContaining({ behavior: 'smooth' }),
        );
      } finally {
        delete document.documentElement.dataset.motion;
      }
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
      expect(scrollToSpy).toHaveBeenCalled();
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

    // A scroll container's own outline paints beneath its scrolled content
    // in every engine, so the slides hid the track's focus ring. The ring is
    // drawn by an empty sibling laid over the track (CSS: track:focus-visible
    // + .ds-carousel__focus-ring) — it must stay the track's next sibling.
    it('renders the focus-ring overlay as the track’s next sibling', () => {
      const { container } = render(
        <Carousel label="Featured products">
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
        </Carousel>,
      );
      const track = container.querySelector('.ds-carousel__track')!;
      const ring = track.nextElementSibling;
      expect(ring).toHaveClass('ds-carousel__focus-ring');
      expect(ring).toBeEmptyDOMElement();
      expect(track.parentElement).toHaveClass('ds-carousel__viewport');
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
      expect(scrollToSpy).toHaveBeenCalledTimes(1);
      await userEvent.keyboard('{ArrowLeft}');
      expect(scrollToSpy).toHaveBeenCalledTimes(2);
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

  describe('scroll geometry regressions', () => {
    // jsdom has no layout: fake 100px slides in a track `viewport` px wide.
    const SLIDE = 100;
    let viewport = 100;
    const scrollPos = new WeakMap<Element, number>();
    const saved = new Map<string, PropertyDescriptor | undefined>();

    function define(name: string, desc: PropertyDescriptor) {
      saved.set(name, Object.getOwnPropertyDescriptor(HTMLElement.prototype, name));
      Object.defineProperty(HTMLElement.prototype, name, { configurable: true, ...desc });
    }

    beforeEach(() => {
      viewport = 100;
      define('offsetLeft', {
        get(this: HTMLElement) {
          if (!this.classList.contains('ds-carousel__slide')) return 0;
          return Array.from(this.parentElement!.children).indexOf(this) * SLIDE;
        },
      });
      define('clientWidth', {
        get(this: HTMLElement) {
          return this.classList.contains('ds-carousel__track') ? viewport : 0;
        },
      });
      define('scrollWidth', {
        get(this: HTMLElement) {
          return this.classList.contains('ds-carousel__track') ? this.children.length * SLIDE : 0;
        },
      });
      define('scrollLeft', {
        get(this: HTMLElement) {
          return scrollPos.get(this) ?? 0;
        },
        set(this: HTMLElement, value: number) {
          scrollPos.set(this, value);
        },
      });
    });

    afterEach(() => {
      saved.forEach((desc, name) => {
        if (desc) Object.defineProperty(HTMLElement.prototype, name, desc);
        else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
      });
      saved.clear();
    });

    const fiveSlides = Array.from({ length: 5 }, (_, i) => (
      <CarouselSlide key={i}>Slide {i + 1}</CarouselSlide>
    ));

    it('advances one slide per click even while a smooth scroll is in flight', async () => {
      const { container } = render(<Carousel controls label="Featured products">{fiveSlides}</Carousel>);
      const track = container.querySelector<HTMLElement>('.ds-carousel__track')!;
      const next = screen.getByRole('button', { name: 'Next slide' });

      await userEvent.click(next);
      expect(scrollToSpy).toHaveBeenLastCalledWith(expect.objectContaining({ left: 100 }));

      // Mid-animation scroll event (30px of the way to slide 2)…
      track.scrollLeft = 30;
      fireEvent.scroll(track);
      await userEvent.click(next);
      // …must not reset the index: the second click heads to slide 3 (200px).
      // It used to re-target slide 2, swallowing the click.
      expect(scrollToSpy).toHaveBeenLastCalledWith(expect.objectContaining({ left: 200 }));
    });

    it('suspends snapping only while a re-targeted scroll is in flight (Safari re-snap)', async () => {
      const { container } = render(<Carousel controls label="Featured products">{fiveSlides}</Carousel>);
      const track = container.querySelector<HTMLElement>('.ds-carousel__track')!;
      const next = screen.getByRole('button', { name: 'Next slide' });

      await userEvent.click(next);
      // A single scroll keeps snapping on.
      expect(track).not.toHaveClass('ds-carousel__track--gliding');
      track.scrollLeft = 30;
      fireEvent.scroll(track);
      await userEvent.click(next);
      expect(track).toHaveClass('ds-carousel__track--gliding');
      // Arrival at the target restores snapping.
      track.scrollLeft = 200;
      fireEvent.scroll(track);
      expect(track).not.toHaveClass('ds-carousel__track--gliding');
    });

    it('ignores a scrollend fired while the track is still moving (Safari re-target)', async () => {
      const frames = () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        });
      const { container } = render(<Carousel controls label="Featured products">{fiveSlides}</Carousel>);
      const track = container.querySelector<HTMLElement>('.ds-carousel__track')!;
      const next = screen.getByRole('button', { name: 'Next slide' });

      await userEvent.click(next);
      track.scrollLeft = 30;
      fireEvent.scroll(track);
      await userEvent.click(next); // heading to slide 3 (200px)
      // WebKit fires scrollend at the moment of re-targeting…
      track.scrollLeft = 60;
      fireEvent(track, new Event('scrollend'));
      // …and the track keeps moving.
      track.scrollLeft = 90;
      await frames();
      await userEvent.click(next);
      // Still stepping from the pending target: slide 4, not slide 2 again.
      expect(scrollToSpy).toHaveBeenLastCalledWith(expect.objectContaining({ left: 300 }));
    });

    it('resumes tracking the real position once the scroll arrives', async () => {
      const { container } = render(
        <Carousel indicators controls label="Featured products">{fiveSlides}</Carousel>,
      );
      const track = container.querySelector<HTMLElement>('.ds-carousel__track')!;
      await userEvent.click(screen.getByRole('button', { name: 'Next slide' }));
      track.scrollLeft = 100;
      fireEvent.scroll(track);
      // A later manual swipe is tracked again
      track.scrollLeft = 300;
      fireEvent.scroll(track);
      expect(screen.getByRole('button', { name: 'Go to slide 4' })).toHaveAttribute('aria-current', 'true');
    });

    it('with loop, wraps as soon as the track cannot scroll further (several slides in view)', async () => {
      viewport = 250; // 2.5 slides in view → max scroll 250; slides 4–5 never reach the edge
      const { container } = render(<Carousel controls loop label="Featured products">{fiveSlides}</Carousel>);
      const track = container.querySelector<HTMLElement>('.ds-carousel__track')!;
      track.scrollLeft = 250;
      fireEvent.scroll(track);
      await userEvent.click(screen.getByRole('button', { name: 'Next slide' }));
      // Was: +50 toward slide 4 — a dead click, since the track is already at max.
      expect(scrollToSpy).toHaveBeenLastCalledWith(expect.objectContaining({ left: 0 }));
    });
  });

  describe('RTL scroll geometry', () => {
    // Browsers' RTL scrollers: scrollLeft runs 0 → negative toward the end,
    // and offsetLeft still counts from the left edge (the first slide sits
    // at the right). The LTR maths sent Next the wrong way in RTL.
    const SLIDE = 100;
    const VIEWPORT = 100;
    const scrollPos = new WeakMap<Element, number>();
    const saved = new Map<string, PropertyDescriptor | undefined>();
    const isSlide = (el: HTMLElement) => el.classList.contains('ds-carousel__slide');
    const isTrack = (el: HTMLElement) => el.classList.contains('ds-carousel__track');

    function define(name: string, desc: PropertyDescriptor) {
      saved.set(name, Object.getOwnPropertyDescriptor(HTMLElement.prototype, name));
      Object.defineProperty(HTMLElement.prototype, name, { configurable: true, ...desc });
    }

    beforeEach(() => {
      define('offsetLeft', {
        get(this: HTMLElement) {
          if (!isSlide(this)) return 0;
          const i = Array.from(this.parentElement!.children).indexOf(this);
          return VIEWPORT - (i + 1) * SLIDE;
        },
      });
      define('offsetWidth', { get(this: HTMLElement) { return isSlide(this) ? SLIDE : 0; } });
      define('clientWidth', { get(this: HTMLElement) { return isTrack(this) ? VIEWPORT : 0; } });
      define('scrollWidth', {
        get(this: HTMLElement) { return isTrack(this) ? this.children.length * SLIDE : 0; },
      });
      define('scrollLeft', {
        get(this: HTMLElement) { return scrollPos.get(this) ?? 0; },
        set(this: HTMLElement, value: number) { scrollPos.set(this, value); },
      });
    });

    afterEach(() => {
      saved.forEach((desc, name) => {
        if (desc) Object.defineProperty(HTMLElement.prototype, name, desc);
        else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
      });
      saved.clear();
    });

    const renderRtl = () =>
      render(
        <div dir="rtl">
          <Carousel controls indicators label="Featured products">
            {Array.from({ length: 5 }, (_, i) => (
              <CarouselSlide key={i}>Slide {i + 1}</CarouselSlide>
            ))}
          </Carousel>
        </div>,
      );

    it('Next scrolls toward the inline end (negative scrollLeft)', async () => {
      renderRtl();
      await userEvent.click(screen.getByRole('button', { name: 'Next slide' }));
      expect(scrollToSpy).toHaveBeenLastCalledWith(expect.objectContaining({ left: -100 }));
      expect(screen.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute('aria-current', 'true');
    });

    it('arrow keys follow the visual direction: ArrowLeft is forward', () => {
      const { container } = renderRtl();
      const track = container.querySelector<HTMLElement>('.ds-carousel__track')!;
      fireEvent.keyDown(track, { key: 'ArrowLeft' });
      expect(scrollToSpy).toHaveBeenLastCalledWith(expect.objectContaining({ left: -100 }));
      track.scrollLeft = -100;
      fireEvent.scroll(track);
      fireEvent.keyDown(track, { key: 'ArrowRight' });
      expect(scrollToSpy).toHaveBeenLastCalledWith(expect.objectContaining({ left: 0 }));
    });

    it('lights the dot for the slide at a negative scroll position', () => {
      const { container } = renderRtl();
      const track = container.querySelector<HTMLElement>('.ds-carousel__track')!;
      track.scrollLeft = -300;
      fireEvent.scroll(track);
      expect(screen.getByRole('button', { name: 'Go to slide 4' })).toHaveAttribute('aria-current', 'true');
    });
  });

  it('leaves arrow keys alone inside a text field in a slide', async () => {
    render(
      <Carousel label="Featured products">
        <CarouselSlide>
          <input aria-label="Gift note" defaultValue="Happy birthday" />
        </CarouselSlide>
        <CarouselSlide>Two</CarouselSlide>
      </Carousel>,
    );
    screen.getByRole('textbox', { name: 'Gift note' }).focus();
    await userEvent.keyboard('{ArrowLeft}{ArrowRight}');
    expect(scrollToSpy).not.toHaveBeenCalled();
  });
});
