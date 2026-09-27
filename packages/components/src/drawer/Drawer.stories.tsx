import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Text } from '../typography/Typography';
import { Drawer } from './Drawer';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
    docs: {
      // Every state opens its drawer on load (so it can be seen without a
      // click); in their own frames they don't cover the docs page.
      story: { inline: false, iframeHeight: 560 },
      description: {
        component:
          'A panel that slides in from the side or bottom of the screen — for menus, filters and the cart.',
      },
    },
  },
  argTypes: {
    side: {
      control: 'select',
      options: ['left', 'right', 'bottom'],
      description: 'Which edge the drawer slides from — `bottom` renders a bottom sheet',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Width preset for left/right drawers (--size-modal-sm/md/lg)',
    },
    width: {
      control: 'text',
      description: 'CSS width value (overrides size; ignored on mobile)',
    },
    title: {
      control: 'text',
      description: 'Accessible title (visually hidden)',
    },
    description: {
      control: 'text',
      description: 'Accessible description announced on open (visually hidden)',
    },
    open: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: function DefaultStory() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        <Drawer open={open} onOpenChange={setOpen} title="Shipping and returns">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <Text weight="semibold">Shipping & returns</Text>
            <Text muted>
              Free standard shipping on orders over $50. Returns are free within 30 days of
              delivery — just keep the tags on.
            </Text>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </Drawer>
      </>
    );
  },
};

export const LeftSide: Story = {
  render: function LeftSideStory() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open left drawer</Button>
        <Drawer
          open={open}
          onOpenChange={setOpen}
          side="left"
          title="Navigation menu"
        >
          <nav>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {['Kitchen', 'Hardware', 'Workshop', 'Journal'].map((item) => (
                <li key={item}>
                  <Button variant="ghost" fullWidth>
                    {item}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </Drawer>
      </>
    );
  },
};

/** `width` sets any width (a token here) instead of the sm/md/lg presets; phones stay full width. */
export const CustomWidth: Story = {
  render: function CustomWidthStory() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open narrow drawer</Button>
        <Drawer
          open={open}
          onOpenChange={setOpen}
          width="calc(var(--spacing-phi-89) * 2)"
          title="Cart"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <Text weight="semibold">Your cart is empty</Text>
            <Text muted>Add items to get started.</Text>
          </div>
        </Drawer>
      </>
    );
  },
};

export const BottomSheet: Story = {
  render: function BottomSheetStory() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open bottom sheet</Button>
        <Drawer
          open={open}
          onOpenChange={setOpen}
          side="bottom"
          title="Filter and sort"
          description="Refine the product list by category and price"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <Text weight="semibold">Sort by</Text>
            {['Newest', 'Price: low to high', 'Price: high to low', 'Best selling'].map(
              (option) => (
                <Button key={option} variant="ghost" fullWidth>
                  {option}
                </Button>
              ),
            )}
            <Button variant="primary" fullWidth onClick={() => setOpen(false)}>
              Apply
            </Button>
          </div>
        </Drawer>
      </>
    );
  },
};

export const SizePresets: Story = {
  render: function SizePresetsStory() {
    const [openSize, setOpenSize] = useState<'sm' | 'md' | 'lg' | null>('md');
    return (
      <>
        <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Button key={size} variant="secondary" onClick={() => setOpenSize(size)}>
              Open {{ sm: 'small', md: 'medium', lg: 'large' }[size]}
            </Button>
          ))}
        </div>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Drawer
            key={size}
            open={openSize === size}
            onOpenChange={(open) => setOpenSize(open ? size : null)}
            size={size}
            title={`${{ sm: 'Small', md: 'Medium', lg: 'Large' }[size]} drawer`}
          >
            <Text>
              {{ sm: 'Small', md: 'Medium', lg: 'Large' }[size]} width — the same three widths
              as the modal, so panels line up across the store.
            </Text>
          </Drawer>
        ))}
      </>
    );
  },
};

const FILTER_VALUES = [
  'Black', 'Bone', 'Brass', 'Charcoal', 'Clay', 'Cognac', 'Forest', 'Indigo', 'Ivory', 'Moss',
  'Natural', 'Navy', 'Oat', 'Olive', 'Rust', 'Sage', 'Sand', 'Slate', 'Stone', 'Walnut',
  'Canvas', 'Ceramic', 'Cotton', 'Leather', 'Linen', 'Merino', 'Stoneware', 'Waxed canvas',
];

/** A long filter list: the panel scrolls; the page behind it stays put. */
export const ScrollableContent: Story = {
  render: function ScrollableStory() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open with long content</Button>
        <Drawer open={open} onOpenChange={setOpen} title="Filter products">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            {FILTER_VALUES.map((value) => (
              <Checkbox key={value} size="sm" label={value} />
            ))}
          </div>
        </Drawer>
      </>
    );
  },
};
