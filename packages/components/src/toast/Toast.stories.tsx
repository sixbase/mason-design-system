import type { Meta, StoryObj } from '@storybook/react';
import { useId, useState } from 'react';
import { Toast, ToastProvider, useToast } from './Toast';
import type { ToastData, ToastPosition, ToastVariant } from './Toast';
import { Button } from '../button/Button';

const meta: Meta<typeof ToastProvider> = {
  title: 'Components/Toast',
  component: ToastProvider,
  parameters: {
    docs: {
      description: {
        component:
          'A short message that pops up in a corner and goes away on its own — “Added to cart”.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

// ─── Helper ───────────────────────────────────────────────

function TriggerButton({
  label,
  variant,
  title,
  description,
  withAction,
}: {
  label: string;
  variant?: ToastVariant;
  title?: string;
  description: string;
  withAction?: boolean;
}) {
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() =>
        toast({
          title,
          description,
          variant,
          action: withAction
            ? { label: 'Undo', onClick: () => console.log('Undo clicked') }
            : undefined,
        })
      }
    >
      {label}
    </Button>
  );
}

// ─── A toast drawn in place ───────────────────────────────
// The same <Toast> the provider renders, placed in the page instead of a
// screen corner and kept until dismissed, so each look can be reviewed
// without clicking. "Try it" below shows the real pop-up behaviour.

function StaticToast({ data }: { data: Omit<ToastData, 'id' | 'duration'> }) {
  const id = useId();
  const [shown, setShown] = useState(true);
  if (!shown) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setShown(true)}>
        Show again
      </Button>
    );
  }
  return <Toast data={{ ...data, id, duration: 0 }} position="top-right" onRemove={() => setShown(false)} />;
}

// ─── Stories ──────────────────────────────────────────────

export const Default: Story = {
  render: () => <StaticToast data={{ variant: 'default', description: 'Your changes have been saved.' }} />,
};

export const WithTitle: Story = {
  render: () => (
    <StaticToast
      data={{ variant: 'success', title: 'Added to cart', description: 'Minimal Canvas Tote — Qty 1' }}
    />
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      <StaticToast data={{ variant: 'default', description: 'Added to your wishlist.' }} />
      <StaticToast data={{ variant: 'success', title: 'Added to cart', description: 'Handmade Ceramic Mug — Qty 2' }} />
      <StaticToast data={{ variant: 'warning', title: 'Low stock', description: 'Only 2 left in size M.' }} />
      <StaticToast data={{ variant: 'error', title: 'Couldn’t update cart', description: 'Check your connection and try again.' }} />
    </div>
  ),
};

export const WithAction: Story = {
  render: () => (
    <StaticToast
      data={{
        variant: 'default',
        title: 'Item removed',
        description: 'Relaxed Linen Shirt was removed from your cart.',
        action: { label: 'Undo', onClick: () => {} },
      }}
    />
  ),
};

/** The real thing: toasts slide in from the corner and leave after five seconds. */
export const EcommerceContext: Story = {
  name: 'Try it: click to show a toast',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
      <TriggerButton
        label="Add to cart"
        variant="success"
        title="Added to cart"
        description="Minimal Canvas Tote — Qty 1"
      />
      <TriggerButton label="Save to wishlist" variant="default" description="Added to your wishlist." />
      <TriggerButton
        label="Remove from cart"
        variant="default"
        title="Item removed"
        description="Relaxed Linen Shirt was removed from your cart."
        withAction
      />
      <TriggerButton
        label="Apply code"
        variant="warning"
        title="Code expired"
        description="SUMMER25 ended on August 31."
      />
      <TriggerButton
        label="Checkout"
        variant="error"
        title="Out of stock"
        description="Wool Throw Blanket sold out while it was in your cart."
      />
    </div>
  ),
};

const MESSAGES: Array<[ToastVariant, string, string]> = [
  ['default', 'Saved', 'Your address was updated.'],
  ['success', 'Added to cart', 'Minimal Canvas Tote — Qty 1'],
  ['error', 'Couldn’t apply code', 'SUMMER25 has expired.'],
  ['warning', 'Low stock', 'Only 2 Handmade Ceramic Mugs left.'],
];

export const Stacking: Story = {
  name: 'Several at once (click repeatedly)',
  render: () => {
    function StackDemo() {
      const { toast } = useToast();
      let count = 0;
      return (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const [variant, title, description] = MESSAGES[count % MESSAGES.length]!;
            count++;
            toast({ title, description, variant });
          }}
        >
          Show a toast
        </Button>
      );
    }
    return <StackDemo />;
  },
};

export const Positions: Story = {
  name: 'Screen corners (click each)',
  parameters: {
    docs: {
      description: {
        story:
          'Four positions, each padded by max(spacing, safe-area inset) so toasts clear notches and home indicators. On touch, swipe a toast toward its nearest screen edge to dismiss it (right positions swipe right, top-center swipes up, bottom-center swipes down).',
      },
    },
  },
  render: () => {
    const positions: ToastPosition[] = ['top-right', 'top-center', 'bottom-right', 'bottom-center'];
    function PositionButton({ position }: { position: ToastPosition }) {
      const { toast } = useToast();
      return (
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            toast({
              title: position,
              description: 'Swipe me toward the nearest edge on touch.',
            })
          }
        >
          {position}
        </Button>
      );
    }
    return (
      <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
        {positions.map((position) => (
          <ToastProvider key={position} position={position}>
            <PositionButton position={position} />
          </ToastProvider>
        ))}
      </div>
    );
  },
};
