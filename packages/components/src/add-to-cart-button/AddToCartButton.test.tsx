import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { AddToCartButton } from './AddToCartButton';

expect.extend(toHaveNoViolations);

describe('AddToCartButton', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<AddToCartButton />);
      expect(screen.getByRole('button', { name: 'Add to Bag' })).toBeInTheDocument();
    });

    it('renders as a button element', () => {
      render(<AddToCartButton />);
      expect(screen.getByRole('button')).toBeInstanceOf(HTMLButtonElement);
    });

    it('defaults to idle status with "Add to Bag" label', () => {
      render(<AddToCartButton />);
      expect(screen.getByRole('button', { name: 'Add to Bag' })).toBeInTheDocument();
    });

    it('defaults to lg size', () => {
      render(<AddToCartButton />);
      expect(screen.getByRole('button')).toHaveClass('ds-button--lg');
    });

    it('merges custom className', () => {
      render(<AddToCartButton className="custom" />);
      expect(screen.getByRole('button')).toHaveClass('custom');
    });
  });

  describe('status variants', () => {
    it('renders idle state', () => {
      render(<AddToCartButton status="idle" />);
      const btn = screen.getByRole('button');
      expect(btn).toHaveTextContent('Add to Bag');
      expect(btn).toHaveClass('ds-add-to-cart--idle');
    });

    it('renders loading state with aria-busy', () => {
      render(<AddToCartButton status="loading" />);
      const btn = screen.getByRole('button');
      expect(btn).toHaveAttribute('aria-busy', 'true');
      expect(btn).toHaveClass('ds-button--loading');
    });

    it('renders success state with check icon', () => {
      render(<AddToCartButton status="success" />);
      const btn = screen.getByRole('button');
      expect(btn).toHaveTextContent('Added!');
      expect(btn).toHaveClass('ds-add-to-cart--success');
      expect(btn.querySelector('.ds-add-to-cart__icon')).toBeInTheDocument();
    });

    it('renders sold-out state with aria-disabled', () => {
      render(<AddToCartButton status="sold-out" />);
      const btn = screen.getByRole('button');
      expect(btn).toHaveTextContent('Sold Out');
      expect(btn).toHaveAttribute('aria-disabled', 'true');
      expect(btn).toHaveClass('ds-add-to-cart--sold-out');
    });

    it('renders pre-order state', () => {
      render(<AddToCartButton status="pre-order" />);
      const btn = screen.getByRole('button');
      expect(btn).toHaveTextContent('Pre-Order');
      expect(btn).toHaveClass('ds-add-to-cart--pre-order');
    });
  });

  describe('custom labels', () => {
    it('accepts custom labels for each status', () => {
      const { rerender } = render(
        <AddToCartButton status="idle" labels={{ idle: 'Add to Cart' }} />,
      );
      expect(screen.getByRole('button')).toHaveTextContent('Add to Cart');

      rerender(
        <AddToCartButton status="sold-out" labels={{ soldOut: 'Unavailable' }} />,
      );
      expect(screen.getByRole('button')).toHaveTextContent('Unavailable');
    });
  });

  describe('interaction', () => {
    it('fires onClick when idle', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<AddToCartButton status="idle" onClick={onClick} />);
      await user.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('fires onClick when pre-order', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<AddToCartButton status="pre-order" onClick={onClick} />);
      await user.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('does not fire onClick when sold-out', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<AddToCartButton status="sold-out" onClick={onClick} />);
      await user.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not fire onClick when loading', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<AddToCartButton status="loading" onClick={onClick} />);
      await user.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<AddToCartButton status="idle" onClick={onClick} />);
      screen.getByRole('button').focus();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledOnce();
    });
  });

  describe('fullWidth', () => {
    it('applies full-width class', () => {
      render(<AddToCartButton fullWidth />);
      expect(screen.getByRole('button')).toHaveClass('ds-button--full-width');
    });
  });

  describe('size', () => {
    it('applies md size class', () => {
      render(<AddToCartButton size="md" />);
      expect(screen.getByRole('button')).toHaveClass('ds-button--md');
    });

    it('applies lg size class', () => {
      render(<AddToCartButton size="lg" />);
      expect(screen.getByRole('button')).toHaveClass('ds-button--lg');
    });
  });

  describe('aria-live region', () => {
    it('renders a live region for status announcements', () => {
      render(<AddToCartButton />);
      const live = document.querySelector('.ds-add-to-cart__live');
      expect(live).toBeInTheDocument();
      expect(live).toHaveAttribute('aria-live', 'polite');
    });

    it('updates live region text on status change', () => {
      const { rerender } = render(<AddToCartButton status="idle" />);
      const live = document.querySelector('.ds-add-to-cart__live');

      rerender(<AddToCartButton status="loading" />);
      expect(live).toHaveTextContent('Adding\u2026');

      rerender(<AddToCartButton status="success" />);
      expect(live).toHaveTextContent('Added!');
    });

    // Regression (a11y audit): the reset to idle announced "Add to Bag" on
    // its own after "Added!", which reads like a second action.
    it('stays quiet when the cycle returns to idle', () => {
      const { rerender } = render(<AddToCartButton status="success" />);
      const live = document.querySelector('.ds-add-to-cart__live');
      rerender(<AddToCartButton status="idle" />);
      expect(live).toBeEmptyDOMElement();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations in idle state', async () => {
      const { container } = render(<AddToCartButton status="idle" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations in loading state', async () => {
      const { container } = render(<AddToCartButton status="loading" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations in sold-out state', async () => {
      const { container } = render(<AddToCartButton status="sold-out" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

// Round 5 (shopper journeys): Added! and Sold Out used pointer-events:
// none, so a second click fell through and the browser moved focus to
// <main tabindex="-1">. The click handler already ignores these states.
describe('AddToCartButton stylesheet', () => {
  const css = readFileSync(resolve(__dirname, 'AddToCartButton.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  it('keeps pointer events in every state, so focus stays on the button', () => {
    expect(css).not.toMatch(/pointer-events/);
  });

  it('does not look pressed or hovered while showing Added!', () => {
    expect(css).toMatch(
      /\.ds-add-to-cart\.ds-add-to-cart--success:active:not\(:disabled\)\s*\{[^}]*background-color: var\(--add-to-cart-success-bg\);[^}]*transform: none;/,
    );
    expect(css).toMatch(/\.ds-add-to-cart\.ds-add-to-cart--success:hover:not\(:disabled\)/);
  });

  it('ignores a second click while showing Added!', async () => {
    const onClick = vi.fn();
    render(<AddToCartButton status="success" onClick={onClick} />);
    const button = screen.getByRole('button');
    await userEvent.dblClick(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button).toHaveFocus();
  });
});
