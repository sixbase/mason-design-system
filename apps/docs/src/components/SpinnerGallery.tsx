import { Spinner } from '@ds/components';

export function SpinnerDefault() {
  return <Spinner />;
}

export function SpinnerSizes() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-6)' }}>
      <Spinner size="sm" label="Small spinner" />
      <Spinner size="md" label="Medium spinner" />
      <Spinner size="lg" label="Large spinner" />
    </div>
  );
}

export function SpinnerWithLabel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      <Spinner size="sm" label="Checking availability" showLabel />
      <Spinner size="md" label="Updating cart" showLabel />
      <Spinner size="lg" label="Loading search results" showLabel />
    </div>
  );
}
