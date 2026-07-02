import { useState, useCallback } from 'react';
import { AddToCartButton } from '@ds/components';
import { Preview } from './Preview';

export function AddToCartButtonDefault() {
  return (
    <Preview>
      <AddToCartButton />
    </Preview>
  );
}

export function AddToCartButtonStatuses() {
  return (
    <Preview stack>
      <AddToCartButton status="idle" />
      <AddToCartButton status="loading" />
      <AddToCartButton status="success" />
      <AddToCartButton status="sold-out" />
      <AddToCartButton status="pre-order" />
    </Preview>
  );
}

export function AddToCartButtonSizes() {
  return (
    <Preview>
      <AddToCartButton size="md" />
      <AddToCartButton size="lg" />
    </Preview>
  );
}

export function AddToCartButtonFullWidth() {
  return (
    <Preview>
      <div style={{ width: '320px', maxWidth: '100%' }}>
        <AddToCartButton fullWidth />
      </div>
    </Preview>
  );
}

export function AddToCartButtonCustomLabels() {
  return (
    <Preview stack>
      <AddToCartButton status="idle" labels={{ idle: 'Add to Cart' }} />
      <AddToCartButton status="sold-out" labels={{ soldOut: 'Notify Me' }} />
      <AddToCartButton status="pre-order" labels={{ preOrder: 'Reserve Now' }} />
    </Preview>
  );
}

export function AddToCartButtonInteractive() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleClick = useCallback(() => {
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    }, 1500);
  }, []);

  return (
    <Preview>
      <div style={{ width: '240px', maxWidth: '100%' }}>
        <AddToCartButton
          status={status}
          onClick={handleClick}
          fullWidth
        />
      </div>
    </Preview>
  );
}
