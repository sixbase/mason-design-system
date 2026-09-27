import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../button';
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

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    docs: {
      description: {
        component:
          'A short list of actions that opens from a button — account links, order actions, sort options.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof DropdownMenu>;

/**
 * Opens on load so the menu can be seen without a click. `modal={false}`
 * keeps the rest of the page usable while it's open (a click anywhere
 * closes it); the space below keeps it off the next state.
 */
export const Default: Story = {
  render: () => (
    <div style={{ minHeight: 'calc(var(--spacing-phi-89) + var(--spacing-12))' }}>
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">Account</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Orders</DropdownMenuItem>
          <DropdownMenuItem>Addresses</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

export const WithLabelAndDestructive: Story = {
  name: 'With a heading and a destructive action',
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Order #1042</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Order actions</DropdownMenuLabel>
        <DropdownMenuItem>View details</DropdownMenuItem>
        <DropdownMenuItem>Track shipment</DropdownMenuItem>
        <DropdownMenuItem>Download invoice</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Cancel order</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const CheckboxItems: Story = {
  name: 'With tick-box items',
  render: function CheckboxItemsStory() {
    const [inStock, setInStock] = useState(true);
    const [onSale, setOnSale] = useState(false);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">Filters</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Availability</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={inStock} onCheckedChange={setInStock}>
            In stock only
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={onSale} onCheckedChange={setOnSale}>
            On sale
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const RadioItems: Story = {
  name: 'Pick one (sort order)',
  render: function RadioItemsStory() {
    const [sort, setSort] = useState('featured');

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">Sort by</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="featured">Featured</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="newest">Newest arrivals</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="price-asc">Price: low to high</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="price-desc">Price: high to low</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const DisabledItems: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Reorder</DropdownMenuItem>
        <DropdownMenuItem disabled>Return items (window closed)</DropdownMenuItem>
        <DropdownMenuItem>Contact support</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** `side` picks the preferred edge (flips on collision); default `bottom`. */
export const Sides: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--spacing-4)', padding: 'var(--spacing-16) 0' }}>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <DropdownMenu key={side}>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">{side}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={side}>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Orders</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  ),
};

/** `align` lines the menu up with the trigger's start, centre, or end; default `start`. */
export const Alignment: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--spacing-4)' }}>
      {(['start', 'center', 'end'] as const).map((align) => (
        <DropdownMenu key={align}>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">Align {align}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={align}>
            <DropdownMenuItem>Newest arrivals</DropdownMenuItem>
            <DropdownMenuItem>Price: low to high</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  ),
};
