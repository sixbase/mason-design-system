import { ProgressBar } from '@ds/components';

export function ProgressBarDefault() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)', maxWidth: '400px' }}>
      <ProgressBar value={60} label="Progress" />
      <ProgressBar value={45} label="Upload progress" showValue />
    </div>
  );
}

export function ProgressBarIndeterminate() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)', maxWidth: '400px' }}>
      <ProgressBar indeterminate label="Loading products" />
      <ProgressBar indeterminate size="sm" label="Refreshing cart" />
    </div>
  );
}

export function ProgressBarSizes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)', maxWidth: '400px' }}>
      <ProgressBar value={60} size="sm" label="Small" />
      <ProgressBar value={60} size="md" label="Medium" />
    </div>
  );
}

export function ProgressBarSuccess() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)', maxWidth: '400px' }}>
      <ProgressBar value={60} variant="success" label="In progress" showValue />
      <ProgressBar value={100} variant="success" label="Complete!" showValue />
    </div>
  );
}

export function ProgressBarCustomText() {
  return (
    <div style={{ maxWidth: '400px' }}>
      <ProgressBar
        value={36}
        max={48}
        label="Free shipping progress"
        valueText="$12 away from free shipping!"
        size="sm"
      />
    </div>
  );
}

export function ProgressBarEcommerce() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)', maxWidth: '400px' }}>
      <ProgressBar
        value={36}
        max={48}
        label="Free shipping progress"
        valueText="$12 away from free shipping!"
        size="sm"
      />
      <ProgressBar
        value={48}
        max={48}
        variant="success"
        label="Free shipping unlocked!"
        size="sm"
      />
      <ProgressBar value={33} label="Step 1 of 3: Shipping" showValue />
    </div>
  );
}
