import { ToastProvider, useToast, Button } from '@ds/components';
import type { ToastVariant } from '@ds/components';
import { Preview } from './Preview';

// ─── Inner components (must be inside ToastProvider) ──────

function VariantButtons() {
  const { toast } = useToast();
  const variants: { variant: ToastVariant; label: string; description: string }[] = [
    { variant: 'default', label: 'Default', description: 'This is a default notification.' },
    { variant: 'success', label: 'Success', description: 'Item added to cart.' },
    { variant: 'error', label: 'Error', description: 'Something went wrong. Please try again.' },
    { variant: 'warning', label: 'Warning', description: 'Your session will expire soon.' },
  ];
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
      {variants.map((v) => (
        <Button
          key={v.variant}
          variant="secondary"
          size="sm"
          onClick={() => toast({ variant: v.variant, description: v.description })}
        >
          {v.label}
        </Button>
      ))}
    </div>
  );
}

function TitleButton() {
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() =>
        toast({
          title: 'Changes Saved',
          description: 'Your preferences have been updated successfully.',
          variant: 'success',
        })
      }
    >
      Show toast with title
    </Button>
  );
}

function ActionButton() {
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() =>
        toast({
          title: 'Item Removed',
          description: 'The item was removed from your cart.',
          variant: 'success',
          action: { label: 'Undo', onClick: () => console.log('Undo clicked') },
        })
      }
    >
      Show toast with action
    </Button>
  );
}

function StackButtons() {
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
          title: `Notification ${count}`,
          description: `This is notification number ${count}.`,
          variant: v,
        });
      }}
    >
      Add toast (click multiple times)
    </Button>
  );
}

function EcommerceButtons() {
  const { toast } = useToast();
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          toast({
            title: 'Added to Cart',
            description: 'Organic Cotton T-Shirt — Qty 1',
            variant: 'success',
          })
        }
      >
        Add to Cart
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          toast({ description: 'Added to your wishlist.', variant: 'default' })
        }
      >
        Wishlist
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          toast({
            title: 'Unavailable',
            description: 'This item is currently out of stock.',
            variant: 'error',
          })
        }
      >
        Out of Stock
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          toast({
            title: 'Discount Applied',
            description: 'Code SAVE20 applied — 20% off your order.',
            variant: 'warning',
          })
        }
      >
        Apply Discount
      </Button>
    </div>
  );
}

function PositionButton({ label }: { label: string }) {
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() =>
        toast({
          title: label,
          description: 'On touch, swipe me toward the nearest screen edge.',
        })
      }
    >
      {label}
    </Button>
  );
}

// ─── Exported gallery sections ────────────────────────────

export function ToastVariants() {
  return (
    <ToastProvider>
      <Preview>
        <VariantButtons />
      </Preview>
    </ToastProvider>
  );
}

export function ToastWithTitle() {
  return (
    <ToastProvider>
      <Preview>
        <TitleButton />
      </Preview>
    </ToastProvider>
  );
}

export function ToastWithAction() {
  return (
    <ToastProvider>
      <Preview>
        <ActionButton />
      </Preview>
    </ToastProvider>
  );
}

export function ToastStacking() {
  return (
    <ToastProvider maxToasts={3}>
      <Preview>
        <StackButtons />
      </Preview>
    </ToastProvider>
  );
}

export function ToastPositions() {
  const positions = ['top-right', 'top-center', 'bottom-right', 'bottom-center'] as const;
  return (
    <Preview>
      <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
        {positions.map((position) => (
          <ToastProvider key={position} position={position}>
            <PositionButton label={position} />
          </ToastProvider>
        ))}
      </div>
    </Preview>
  );
}

export function ToastEcommerce() {
  return (
    <ToastProvider>
      <Preview>
        <EcommerceButtons />
      </Preview>
    </ToastProvider>
  );
}
