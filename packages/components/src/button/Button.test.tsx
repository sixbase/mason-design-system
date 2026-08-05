import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

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
    it('is disabled when loading', () => {
      render(<Button loading>Submit</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute('aria-busy', 'true');
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
});
