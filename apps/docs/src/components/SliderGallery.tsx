import { useState } from 'react';
import { Slider } from '@ds/components';

export function SliderDefault() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)', maxWidth: '400px' }}>
      <Slider label="Volume" defaultValue={[60]} />
      <Slider label="Brightness" defaultValue={[45]} showValue />
    </div>
  );
}

export function SliderRange() {
  const [range, setRange] = useState([25, 80]);
  return (
    <div style={{ maxWidth: '400px' }}>
      <Slider
        label="Price"
        min={0}
        max={200}
        step={5}
        value={range}
        onValueChange={setRange}
        formatValue={(v) => `$${v}`}
        thumbLabels={['Minimum price', 'Maximum price']}
        showValue
      />
    </div>
  );
}

export function SliderStepped() {
  return (
    <div style={{ maxWidth: '400px' }}>
      <Slider label="Quantity" min={0} max={50} step={5} defaultValue={[20]} showValue />
    </div>
  );
}

export function SliderDisabled() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)', maxWidth: '400px' }}>
      <Slider label="Unavailable" defaultValue={[40]} disabled />
      <Slider
        label="Price"
        defaultValue={[25, 80]}
        formatValue={(v) => `$${v}`}
        showValue
        disabled
      />
    </div>
  );
}

export function SliderEcommerce() {
  const [range, setRange] = useState([2500, 8000]);
  const formatCents = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  return (
    <div style={{ maxWidth: '280px' }}>
      <Slider
        label="Price"
        min={0}
        max={20000}
        step={500}
        value={range}
        onValueChange={setRange}
        formatValue={formatCents}
        thumbLabels={['Minimum price', 'Maximum price']}
        showValue
      />
    </div>
  );
}
