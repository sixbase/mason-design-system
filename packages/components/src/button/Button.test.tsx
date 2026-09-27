import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetDevWarnings } from '../internal/dev-warning';
import { Button } from './Button';

/**
 * Declarations of the top-level rule whose selector is exactly `selector`.
 * jsdom can't evaluate `var()` inside shorthands like `outline`, so CSS
 * regressions are asserted against the stylesheet source.
 */
function cssRule(selector: string): string {
  const css = readFileSync(resolve(__dirname, 'Button.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`(?:^|})\\s*${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
}

describe('Button', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('applies variant class', () => {
      render(<Button variant="destructive">Delete</Button>);
      expect(screen.getByRole('button')).toHaveClass('ds-button--destructive');
    });

    it('applies size class', () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('ds-button--lg');
    });

    it('defaults to primary variant and md size', () => {
      render(<Button>Default</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toHaveClass('ds-button--primary', 'ds-button--md');
    });

    it('merges custom className', () => {
      render(<Button className="custom-class">Btn</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });

  describe('asChild', () => {
    it('renders as an anchor when asChild is used', () => {
      render(
        <Button asChild>
          <a href="/home">Home</a>
        </Button>,
      );
      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    });

    it('does not put a type attribute on the slotted link', () => {
      render(<Button asChild><a href="/home">Home</a></Button>);
      expect(screen.getByRole('link')).not.toHaveAttribute('type');
    });

    // Regression: a disabled asChild link kept its tab stop, got an
    // invalid `disabled` attribute, and still navigated on click/Enter.
    it('takes a disabled link out of the tab order and blocks navigation', () => {
      const onClick = vi.fn();
      render(
        <Button asChild disabled onClick={onClick}>
          <a href="/checkout">Checkout</a>
        </Button>,
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).toHaveAttribute('tabindex', '-1');
      expect(link).not.toHaveAttribute('disabled');
      // fireEvent returns false when the default action was prevented
      expect(fireEvent.click(link)).toBe(false);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('form behavior', () => {
    // Regression: no default type meant every Button inside a <form>
    // was a submit button (e.g. a "Clear filters" button submitted).
    it('does not submit a surrounding form by default', async () => {
      const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
      render(<form onSubmit={onSubmit}><Button>Clear filters</Button></form>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
      await userEvent.setup().click(screen.getByRole('button'));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('submits when type="submit" is passed', async () => {
      const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
      render(<form onSubmit={onSubmit}><Button type="submit">Save</Button></form>);
      await userEvent.setup().click(screen.getByRole('button'));
      expect(onSubmit).toHaveBeenCalledOnce();
    });
  });

  describe('disabled state', () => {
    it('is disabled when disabled prop is set', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('does not fire onClick when disabled', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button disabled onClick={onClick}>Disabled</Button>);
      await user.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('is aria-disabled and busy when loading, but not natively disabled', () => {
      render(<Button loading>Submit</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toHaveAttribute('aria-disabled', 'true');
      expect(btn).toHaveAttribute('aria-busy', 'true');
      // Native disabled would drop keyboard focus to <body>
      expect(btn).not.toHaveAttribute('disabled');
    });

    it('keeps keyboard focus when it switches to loading', () => {
      const { rerender } = render(<Button>Add to bag</Button>);
      const btn = screen.getByRole('button');
      btn.focus();
      rerender(<Button loading>Add to bag</Button>);
      expect(document.activeElement).toBe(btn);
    });

    it('swallows clicks while loading (no double submit)', () => {
      const onClick = vi.fn();
      const onSubmit = vi.fn((e: Event) => e.preventDefault());
      render(
        <form onSubmit={onSubmit as unknown as React.FormEventHandler}>
          <Button type="submit" loading onClick={onClick}>
            Pay
          </Button>
        </form>,
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('shows spinner when loading', () => {
      render(<Button loading>Submit</Button>);
      expect(document.querySelector('.ds-button__spinner')).toBeInTheDocument();
    });

    it('applies loading class', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByRole('button')).toHaveClass('ds-button--loading');
    });
  });

  describe('interaction', () => {
    it('fires onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click</Button>);
      await user.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click</Button>);
      screen.getByRole('button').focus();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledOnce();
    });
  });

  describe('icon-only', () => {
    it('applies the icon-only class', () => {
      render(
        <Button iconOnly aria-label="Close">
          <span data-testid="x-icon" />
        </Button>,
      );
      expect(screen.getByRole('button', { name: 'Close' })).toHaveClass('ds-button--icon-only');
    });

    it('fires onClick when an icon-only button is clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button iconOnly aria-label="Close" onClick={onClick}>
          <span data-testid="x-icon" />
        </Button>,
      );
      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('remains clickable inside a flex row next to siblings', async () => {
      const user = userEvent.setup();
      const onIconClick = vi.fn();
      const onSiblingClick = vi.fn();
      render(
        <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
          <Button size="sm" onClick={onSiblingClick}>Sibling</Button>
          <Button size="sm" iconOnly aria-label="Remove" onClick={onIconClick}>
            <span data-testid="x-icon" />
          </Button>
        </div>,
      );
      await user.click(screen.getByRole('button', { name: 'Remove' }));
      await user.click(screen.getByRole('button', { name: 'Sibling' }));
      expect(onIconClick).toHaveBeenCalledOnce();
      expect(onSiblingClick).toHaveBeenCalledOnce();
    });

    it('has no accessibility violations', async () => {
      const { container } = render(
        <Button iconOnly aria-label="Close">
          <span aria-hidden="true">×</span>
        </Button>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    // Regression: spinner and icon rendered side by side in the square.
    it('shows the spinner instead of the icon while loading', () => {
      render(
        <Button iconOnly loading aria-label="Save">
          <svg data-testid="icon" />
        </Button>,
      );
      expect(document.querySelector('.ds-button__spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });
  });

  describe('focus ring', () => {
    // Regression: the ring was box-shadow only, which forced-colors mode
    // (Windows High Contrast) drops — keyboard focus became invisible.
    it('keeps a transparent outline that forced-colors mode can repaint', () => {
      expect(cssRule('.ds-button:focus-visible')).toMatch(
        /outline:\s*var\(--border-width-lg\) solid transparent/,
      );
    });

    // One rule un-fades every focused aria-disabled button — Sold Out and
    // loading alike, because a loading button is aria-disabled.
    it('un-fades a focused aria-disabled (or loading) button so its ring keeps full contrast', () => {
      render(<Button loading>Adding…</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
      expect(cssRule('.ds-button[aria-disabled="true"]:focus-visible')).toMatch(
        /opacity:\s*var\(--opacity-full\)/,
      );
    });
  });

  describe('icons', () => {
    it('renders leading icon', () => {
      render(<Button leadingIcon={<span data-testid="icon" />}>Label</Button>);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders trailing icon', () => {
      render(<Button trailingIcon={<span data-testid="icon" />}>Label</Button>);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('hides icons when loading', () => {
      render(
        <Button loading leadingIcon={<span data-testid="icon" />}>
          Label
        </Button>,
      );
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <div>
          <Button>Add to cart</Button>
          <Button variant="secondary" size="lg">View details</Button>
          <Button disabled>Out of stock</Button>
          <Button loading>Adding…</Button>
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('fullWidth', () => {
    it('adds the full-width modifier only when set', () => {
      const { rerender } = render(<Button>Checkout</Button>);
      expect(screen.getByRole('button')).not.toHaveClass('ds-button--full-width');
      rerender(<Button fullWidth>Checkout</Button>);
      expect(screen.getByRole('button')).toHaveClass('ds-button--full-width');
    });
  });

  describe('dev warnings', () => {
    beforeEach(() => resetDevWarnings());

    it('warns when iconOnly has no accessible name', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<Button iconOnly>×</Button>);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('`iconOnly` needs an `aria-label`'));
      warn.mockRestore();
    });

    it('stays quiet when iconOnly is named', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <>
          <Button iconOnly aria-label="Close">×</Button>
          <Button iconOnly aria-labelledby="x">×</Button>
          <Button iconOnly asChild>
            <a href="/cart" aria-label="Cart">🛍</a>
          </Button>
        </>,
      );
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  // Round 5 (shopper journeys): pointer-events: none on a loading (or
  // aria-disabled) button let a double-click fall through to the page, and
  // the browser moved focus to <main tabindex="-1"> — the cart drawer then
  // returned focus there too. Only native-disabled buttons and disabled
  // asChild links drop pointer events now; the click handler does the rest.
  describe('busy and aria-disabled buttons keep their clicks', () => {
    it('does not drop pointer events on a focusable button', () => {
      const disabled = cssRule('.ds-button:disabled,\n.ds-button[aria-disabled="true"]');
      expect(disabled).toMatch(/cursor: not-allowed/);
      expect(disabled).not.toMatch(/pointer-events/);
      const loading = cssRule('.ds-button.ds-button--loading');
      expect(loading).toMatch(/cursor: wait/);
      expect(loading).not.toMatch(/pointer-events/);
      expect(cssRule('.ds-button:disabled,\n.ds-button[aria-disabled="true"]:not(button)')).toMatch(
        /pointer-events: none/,
      );
    });

    it('swallows a second click while loading', async () => {
      const onClick = vi.fn();
      render(<Button loading onClick={onClick}>Add to Bag</Button>);
      const button = screen.getByRole('button');
      await userEvent.dblClick(button);
      expect(onClick).not.toHaveBeenCalled();
      expect(button).toHaveFocus();
    });
  });
});
