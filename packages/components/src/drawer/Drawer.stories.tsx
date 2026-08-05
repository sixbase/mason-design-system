import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../button';
import { Drawer } from './Drawer';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A slide-out panel anchored to the left or right edge. Used as a primitive for cart drawers, mobile menus, and filter sidebars.',
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
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        <Drawer open={open} onOpenChange={setOpen} title="Default drawer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
              Drawer content
            </p>
            <p style={{ margin: 0, color: 'var(--color-foreground-subtle)' }}>
              This is a generic slide-out panel that can hold any content.
            </p>
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
    const [open, setOpen] = useState(false);
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
              {['Home', 'Shop', 'About', 'Contact'].map((item) => (
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

export const CustomWidth: Story = {
  render: function CustomWidthStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open narrow drawer</Button>
        <Drawer
          open={open}
          onOpenChange={setOpen}
          width="360px"
          title="Cart"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
              Your cart is empty
            </p>
            <p style={{ margin: 0, color: 'var(--color-foreground-subtle)' }}>
              Add items to get started.
            </p>
          </div>
        </Drawer>
      </>
    );
  },
};

export const BottomSheet: Story = {
  render: function BottomSheetStory() {
    const [open, setOpen] = useState(false);
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
            <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
              Sort by
            </p>
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
    const [openSize, setOpenSize] = useState<'sm' | 'md' | 'lg' | null>(null);
    return (
      <>
        <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Button key={size} variant="secondary" onClick={() => setOpenSize(size)}>
              Open {size}
            </Button>
          ))}
        </div>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Drawer
            key={size}
            open={openSize === size}
            onOpenChange={(open) => setOpenSize(open ? size : null)}
            size={size}
            title={`${size} drawer`}
          >
            <p style={{ margin: 0 }}>
              This drawer uses the <code>{size}</code> width preset
              (<code>--size-modal-{size}</code>).
            </p>
          </Drawer>
        ))}
      </>
    );
  },
};

export const ScrollableContent: Story = {
  render: function ScrollableStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open with long content</Button>
        <Drawer open={open} onOpenChange={setOpen} title="Filter products">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                style={{
                  padding: 'var(--spacing-3)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                Filter option {i + 1}
              </div>
            ))}
          </div>
        </Drawer>
      </>
    );
  },
};
