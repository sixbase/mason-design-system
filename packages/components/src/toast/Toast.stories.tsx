import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast } from './Toast';
import type { ToastPosition, ToastVariant } from './Toast';
import { Button } from '../button/Button';

const meta: Meta<typeof ToastProvider> = {
  title: 'Components/Toast',
  component: ToastProvider,
  tags: ['autodocs'],
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

// ─── Stories ──────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <TriggerButton
      label="Show toast"
      description="Your changes have been saved."
    />
  ),
};

export const WithTitle: Story = {
  render: () => (
    <TriggerButton
      label="Show toast with title"
      title="Changes Saved"
      description="Your preferences have been updated successfully."
    />
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
      <TriggerButton
        label="Default"
        variant="default"
        description="This is a default notification."
      />
      <TriggerButton
        label="Success"
        variant="success"
        description="Item added to cart."
      />
      <TriggerButton
        label="Error"
        variant="error"
        description="Something went wrong. Please try again."
      />
      <TriggerButton
        label="Warning"
        variant="warning"
        description="Your session will expire in 5 minutes."
      />
    </div>
  ),
};

export const WithAction: Story = {
  render: () => (
    <TriggerButton
      label="Show toast with action"
      variant="success"
      title="Item Removed"
      description="The item was removed from your cart."
      withAction
    />
  ),
};

export const Stacking: Story = {
  render: () => {
    function StackDemo() {
      const { toast } = useToast();
      const variants: ToastVariant[] = ['default', 'success', 'error', 'warning'];
      let count = 0;
      return (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const v = variants[count % variants.length];
            count++;
            toast({
              title: `Toast ${count}`,
              description: `This is toast number ${count}.`,
              variant: v,
            });
          }}
        >
          Add toast (click multiple times)
        </Button>
      );
    }
    return <StackDemo />;
  },
};

export const Positions: Story = {
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

export const EcommerceContext: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
      <TriggerButton
        label="Add to Cart"
        variant="success"
        title="Added to Cart"
        description="Organic Cotton T-Shirt — Qty 1"
      />
      <TriggerButton
        label="Wishlist"
        variant="default"
        description="Added to your wishlist."
      />
      <TriggerButton
        label="Out of Stock"
        variant="error"
        title="Unavailable"
        description="This item is currently out of stock."
      />
      <TriggerButton
        label="Discount Applied"
        variant="warning"
        title="Discount"
        description="Code SAVE20 applied — 20% off your order."
      />
    </div>
  ),
};
