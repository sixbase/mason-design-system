import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('renders 5 stars', () => {
    const { container } = render(<StarRating rating={3} />);
    expect(container.querySelectorAll('.ds-star-rating__star')).toHaveLength(5);
  });

  it('renders correct filled stars for whole rating', () => {
    const { container } = render(<StarRating rating={3} />);
    expect(container.querySelectorAll('.ds-star-rating__star--full')).toHaveLength(3);
    expect(container.querySelectorAll('.ds-star-rating__star--empty')).toHaveLength(2);
  });

  it('renders half star for fractional rating', () => {
    const { container } = render(<StarRating rating={4.5} />);
    expect(container.querySelectorAll('.ds-star-rating__star--full')).toHaveLength(4);
    expect(container.querySelectorAll('.ds-star-rating__star--half')).toHaveLength(1);
    expect(container.querySelectorAll('.ds-star-rating__star--empty')).toHaveLength(0);
  });

  it('renders zero stars for rating 0', () => {
    const { container } = render(<StarRating rating={0} />);
    expect(container.querySelectorAll('.ds-star-rating__star--full')).toHaveLength(0);
    expect(container.querySelectorAll('.ds-star-rating__star--empty')).toHaveLength(5);
  });

  it('clamps rating to 0-5 range', () => {
    const { container } = render(<StarRating rating={7} />);
    expect(container.querySelectorAll('.ds-star-rating__star--full')).toHaveLength(5);
  });

  it('displays review count', () => {
    render(<StarRating rating={4} reviewCount={128} />);
    expect(screen.getByText('(128 reviews)')).toBeInTheDocument();
  });

  it('uses singular "review" for count of 1', () => {
    render(<StarRating rating={5} reviewCount={1} />);
    expect(screen.getByText('(1 review)')).toBeInTheDocument();
  });

  it('does not render count when reviewCount is not provided', () => {
    const { container } = render(<StarRating rating={4} />);
    expect(container.querySelector('.ds-star-rating__count')).not.toBeInTheDocument();
  });

  it('has accessible aria-label', () => {
    render(<StarRating rating={4.5} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '4.5 out of 5 stars');
  });

  it('applies size class', () => {
    const { container } = render(<StarRating rating={3} size="lg" />);
    expect(container.querySelector('.ds-star-rating--lg')).toBeInTheDocument();
  });

  it('defaults to md size', () => {
    const { container } = render(<StarRating rating={3} />);
    expect(container.querySelector('.ds-star-rating--md')).toBeInTheDocument();
  });

  it('renders a visible label in display mode', () => {
    render(<StarRating rating={4} label="Customer rating" />);
    expect(screen.getByText('Customer rating')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'Customer rating: 4 out of 5 stars',
    );
  });

  describe('interactive mode', () => {
    it('renders a radiogroup with 5 radios when onRate is provided', () => {
      render(<StarRating rating={3} onRate={vi.fn()} />);
      const group = screen.getByRole('radiogroup', { name: 'Rating' });
      expect(within(group).getAllByRole('radio')).toHaveLength(5);
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('marks the current rating as checked', () => {
      render(<StarRating rating={3} onRate={vi.fn()} />);
      expect(screen.getByRole('radio', { name: '3 stars' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
      expect(screen.getByRole('radio', { name: '4 stars' })).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });

    it('calls onRate on click', async () => {
      const user = userEvent.setup();
      const onRate = vi.fn();
      render(<StarRating rating={2} onRate={onRate} />);
      await user.click(screen.getByRole('radio', { name: '5 stars' }));
      expect(onRate).toHaveBeenCalledWith(5);
    });

    it('moves selection with arrow keys', async () => {
      const user = userEvent.setup();
      const onRate = vi.fn();
      render(<StarRating rating={3} onRate={onRate} />);
      screen.getByRole('radio', { name: '3 stars' }).focus();
      await user.keyboard('{ArrowRight}');
      expect(onRate).toHaveBeenCalledWith(4);
      await user.keyboard('{ArrowLeft}');
      expect(onRate).toHaveBeenCalledWith(2);
    });

    // Stars run right-to-left in RTL, so the horizontal arrows swap. The
    // direction check read only computed style, which jsdom leaves empty —
    // this case was untested; it now shares internal/direction's fallback.
    it('swaps the horizontal arrows in right-to-left pages', async () => {
      const user = userEvent.setup();
      const onRate = vi.fn();
      render(
        <div dir="rtl">
          <StarRating rating={3} onRate={onRate} />
        </div>,
      );
      screen.getByRole('radio', { name: '3 stars' }).focus();
      await user.keyboard('{ArrowLeft}');
      expect(onRate).toHaveBeenLastCalledWith(4);
      await user.keyboard('{ArrowRight}');
      expect(onRate).toHaveBeenLastCalledWith(2);
    });

    it('wraps arrow-key selection at the ends', async () => {
      const user = userEvent.setup();
      const onRate = vi.fn();
      render(<StarRating rating={5} onRate={onRate} />);
      screen.getByRole('radio', { name: '5 stars' }).focus();
      await user.keyboard('{ArrowRight}');
      expect(onRate).toHaveBeenCalledWith(1);
    });

    // Regression (keyboard audit): Up raised the rating like a slider and
    // Down lowered it — the reverse of the APG radio pattern (Down = next).
    it('follows the APG radio arrow mapping for Up and Down', async () => {
      const user = userEvent.setup();
      const onRate = vi.fn();
      render(<StarRating rating={3} onRate={onRate} />);
      screen.getByRole('radio', { name: '3 stars' }).focus();
      await user.keyboard('{ArrowDown}');
      expect(onRate).toHaveBeenLastCalledWith(4);
      await user.keyboard('{ArrowUp}');
      expect(onRate).toHaveBeenLastCalledWith(2);
    });

    // Regression (keyboard audit): unrated, focus enters on star 1 (unchecked)
    // and the first ArrowRight re-selected star 1 instead of moving to 2.
    it('moves on from the focused star when unrated', async () => {
      const user = userEvent.setup();
      const onRate = vi.fn();
      render(<StarRating rating={0} onRate={onRate} />);
      await user.tab();
      expect(screen.getByRole('radio', { name: '1 star' })).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(onRate).toHaveBeenLastCalledWith(2);
      expect(screen.getByRole('radio', { name: '2 stars' })).toHaveFocus();
    });

    it('uses roving tabindex — only the checked star is tabbable', () => {
      render(<StarRating rating={3} onRate={vi.fn()} />);
      expect(screen.getByRole('radio', { name: '3 stars' })).toHaveAttribute('tabindex', '0');
      expect(screen.getByRole('radio', { name: '1 star' })).toHaveAttribute('tabindex', '-1');
    });

    it('makes the first star tabbable when unrated', () => {
      render(<StarRating rating={0} onRate={vi.fn()} />);
      expect(screen.getByRole('radio', { name: '1 star' })).toHaveAttribute('tabindex', '0');
    });

    it('labels the radiogroup with the visible label when provided', () => {
      render(<StarRating rating={3} onRate={vi.fn()} label="Your rating" />);
      expect(screen.getByRole('radiogroup', { name: 'Your rating' })).toBeInTheDocument();
      expect(screen.getByText('Your rating')).toBeInTheDocument();
    });

    it('renders radio buttons with type="button"', () => {
      render(<StarRating rating={3} onRate={vi.fn()} />);
      screen.getAllByRole('radio').forEach((radio) => {
        expect(radio).toHaveAttribute('type', 'button');
      });
    });

    it('has no accessibility violations in interactive mode', async () => {
      const { container } = render(
        <StarRating rating={3} onRate={vi.fn()} label="Your rating" reviewCount={12} />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StarRating rating={4.5} reviewCount={128} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  describe('regressions', () => {
    it('groups the review count in an explicit locale, not the runtime default (SSR/hydration)', () => {
      // toLocaleString() with no locale used Node's default on the server
      // and the browser's on the client — "1,234" vs "1.234" mismatched.
      const spy = vi.spyOn(Number.prototype, 'toLocaleString');
      const { rerender } = render(<StarRating rating={4} reviewCount={1234} />);
      expect(screen.getByText('(1,234 reviews)')).toBeInTheDocument();
      expect(spy).not.toHaveBeenCalledWith();
      rerender(<StarRating rating={4} reviewCount={1234} locale="de-DE" />);
      expect(screen.getByText(`(${(1234).toLocaleString('de-DE')} reviews)`)).toBeInTheDocument();
      spy.mockRestore();
    });

    it('reads a NaN rating as 0, never "NaN"', () => {
      render(<StarRating rating={NaN} />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', '0 out of 5 stars');
    });

    it('rounds computed averages to one decimal in the accessible name', () => {
      render(<StarRating rating={14 / 3} />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', '4.7 out of 5 stars');
    });

    it('includes the review count in the accessible name (role="img" hides children)', () => {
      render(<StarRating rating={4.5} reviewCount={128} label="Customer rating" />);
      expect(
        screen.getByRole('img', { name: 'Customer rating: 4.5 out of 5 stars, 128 reviews' }),
      ).toBeInTheDocument();
    });

    it('does not render a NaN review count', () => {
      const { container } = render(<StarRating rating={4} reviewCount={NaN} />);
      expect(container.querySelector('.ds-star-rating__count')).not.toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', '4 out of 5 stars');
    });
  });
});
