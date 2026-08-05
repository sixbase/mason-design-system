import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './DropdownMenu';

function TestMenu({
  onSelect,
  onOpenChange,
}: {
  onSelect?: (event: Event) => void;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger>Account</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuItem onSelect={onSelect}>Profile</DropdownMenuItem>
        <DropdownMenuItem>Orders</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe('DropdownMenu', () => {
  it('renders the trigger and hides the menu initially', () => {
    render(<TestMenu />);
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens the menu on trigger click', async () => {
    const user = userEvent.setup();
    render(<TestMenu />);

    await user.click(screen.getByText('Account'));
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
  });

  it('opens the menu with the keyboard', async () => {
    const user = userEvent.setup();
    render(<TestMenu />);

    await user.tab();
    expect(screen.getByText('Account')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('menu')).toBeInTheDocument();
  });

  it('moves focus through items with arrow keys', async () => {
    const user = userEvent.setup();
    render(<TestMenu />);

    await user.tab();
    await user.keyboard('{Enter}');
    await screen.findByRole('menu');

    // Opening with the keyboard focuses the first item automatically
    expect(screen.getByText('Profile')).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Orders')).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Sign out')).toHaveFocus();
  });

  it('closes when pressing Escape', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<TestMenu onOpenChange={onOpenChange} />);

    await user.click(screen.getByText('Account'));
    await screen.findByRole('menu');

    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('fires onSelect when an item is activated', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<TestMenu onSelect={onSelect} />);

    await user.click(screen.getByText('Account'));
    await user.click(await screen.findByText('Profile'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('applies the destructive variant class', async () => {
    const user = userEvent.setup();
    render(<TestMenu />);

    await user.click(screen.getByText('Account'));
    const item = await screen.findByText('Sign out');
    expect(item.className).toContain('ds-dropdown-menu__item--destructive');
  });

  it('renders label and separator', async () => {
    const user = userEvent.setup();
    render(<TestMenu />);

    await user.click(screen.getByText('Account'));
    await screen.findByRole('menu');
    expect(screen.getByText('My account')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('toggles checkbox items with aria-checked', async () => {
    function Filters() {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>Filters</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked>In stock</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={false}>On sale</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    const user = userEvent.setup();
    render(<Filters />);

    await user.click(screen.getByText('Filters'));
    const checked = await screen.findByRole('menuitemcheckbox', { name: 'In stock' });
    const unchecked = screen.getByRole('menuitemcheckbox', { name: 'On sale' });
    expect(checked).toHaveAttribute('aria-checked', 'true');
    expect(unchecked).toHaveAttribute('aria-checked', 'false');
  });

  it('marks the selected radio item', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Sort</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="newest">
            <DropdownMenuRadioItem value="featured">Featured</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByText('Sort'));
    const selected = await screen.findByRole('menuitemradio', { name: 'Newest' });
    expect(selected).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Featured' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('does not activate disabled items', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onSelect={onSelect}>
            Unavailable
          </DropdownMenuItem>
          <DropdownMenuItem>Available</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByText('Actions'));
    const item = await screen.findByText('Unavailable');
    expect(item).toHaveAttribute('data-disabled');
    expect(item).toHaveAttribute('aria-disabled', 'true');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('has no accessibility violations when open', async () => {
    const user = userEvent.setup();
    const { container } = render(<TestMenu />);

    await user.click(screen.getByText('Account'));
    await screen.findByRole('menu');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations when closed', async () => {
    const { container } = render(<TestMenu />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
