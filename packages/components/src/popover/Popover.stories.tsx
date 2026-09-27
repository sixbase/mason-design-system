import type { Meta, StoryObj } from '@storybook/react';
import { useId } from 'react';
import { Button } from '../button';
import { Text } from '../typography/Typography';
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
  parameters: {
    docs: {
      description: {
        component:
          'A small panel that opens next to a button with extra detail — a size tip, shipping info.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Popover>;

/** Opens on load so it can be seen without a click; the space below keeps it off the next state. */
export const Default: Story = {
  render: () => (
    <div style={{ minHeight: 'var(--spacing-phi-89)' }}>
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="secondary">Size guide</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          Measurements are in inches. Between sizes? Size up for a relaxed fit.
        </PopoverContent>
      </Popover>
    </div>
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
        {/* showClose already reserves the close button's column */}
        Free standard shipping on orders over $75. Express available at checkout.
      </PopoverContent>
    </Popover>
  ),
};

export const WithComposedClose: Story = {
  name: 'With its own Cancel button',
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

/**
 * A panel is announced by its button's name ("Care instructions, dialog").
 * When it has a title of its own, point `aria-labelledby` at it instead.
 */
export const WithTitle: Story = {
  name: 'With a title (names the panel)',
  render: function WithTitleStory() {
    const titleId = useId();
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">Care</Button>
        </PopoverTrigger>
        <PopoverContent aria-labelledby={titleId} showClose>
          <PopoverArrow />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
            <Text id={titleId} as="span" size="sm" weight="semibold">
              Care instructions
            </Text>
            <Text as="span" size="sm">
              Dishwasher and microwave safe. Avoid sudden temperature changes.
            </Text>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
};

export const Sides: Story = {
  render: () => (
    // Wraps on phones: four triggers plus 64px side padding overflowed 375px
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--spacing-4)', padding: 'var(--spacing-16) 0' }}>
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
