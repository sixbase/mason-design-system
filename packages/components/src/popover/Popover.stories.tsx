import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import {
  Popover,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from './Popover';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Size guide</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        Measurements are in inches. Between sizes? Size up for a relaxed fit.
      </PopoverContent>
    </Popover>
  ),
};

export const WithCloseButton: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Shipping info</Button>
      </PopoverTrigger>
      <PopoverContent showClose>
        <PopoverArrow />
        <div style={{ paddingRight: 'var(--spacing-8)' }}>
          Free standard shipping on orders over $75. Express available at checkout.
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithComposedClose: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Confirm removal</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          Remove this item from your cart?
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <PopoverClose asChild>
              <Button size="sm" variant="secondary">Cancel</Button>
            </PopoverClose>
            <Button size="sm" variant="destructive">Remove</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Sides: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-4)', padding: 'var(--spacing-16)' }}>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="secondary">{side}</Button>
          </PopoverTrigger>
          <PopoverContent side={side}>
            <PopoverArrow />
            Anchored to the {side} side.
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};
