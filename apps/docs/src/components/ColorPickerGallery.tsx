import { useState } from 'react';
import { ColorPicker } from '@ds/components';
import { Preview } from './Preview';

const COLORS = [
  { value: 'black', color: '#1a1a1a', label: 'Carbon Black' },
  { value: 'navy', color: '#1e3a5f', label: 'Navy Blue' },
  { value: 'olive', color: '#556b2f', label: 'Olive Green' },
  { value: 'tan', color: '#c8b08c', label: 'Desert Tan' },
  { value: 'white', color: '#f5f5f0', label: 'Natural White' },
];

export function ColorPickerDefault() {
  const [value, setValue] = useState('black');
  return (
    <Preview>
      <ColorPicker options={COLORS} value={value} onChange={setValue} />
    </Preview>
  );
}

export function ColorPickerWithLabel() {
  const [value, setValue] = useState('black');
  return (
    <Preview>
      <ColorPicker
        options={COLORS}
        value={value}
        onChange={setValue}
        showLabel
        aria-label="Case color"
      />
    </Preview>
  );
}

export function ColorPickerSizes() {
  const [value, setValue] = useState('black');
  return (
    <Preview stack>
      <ColorPicker options={COLORS} value={value} onChange={setValue} size="sm" />
      <ColorPicker options={COLORS} value={value} onChange={setValue} size="md" />
      <ColorPicker options={COLORS} value={value} onChange={setValue} size="lg" />
    </Preview>
  );
}
