import { useState } from 'react';
import { QuantitySelector } from '@ds/components';
import { Preview } from './Preview';

export function QuantitySelectorDefault() {
  const [value, setValue] = useState(1);
  return (
    <Preview>
      <QuantitySelector value={value} onChange={setValue} />
    </Preview>
  );
}

export function QuantitySelectorSizes() {
  const [sm, setSm] = useState(1);
  const [md, setMd] = useState(1);
  const [lg, setLg] = useState(1);
  return (
    <Preview>
      <QuantitySelector value={sm} onChange={setSm} size="sm" />
      <QuantitySelector value={md} onChange={setMd} size="md" />
      <QuantitySelector value={lg} onChange={setLg} size="lg" />
    </Preview>
  );
}

export function QuantitySelectorEditable() {
  const [value, setValue] = useState(5);
  return (
    <Preview>
      <QuantitySelector value={value} onChange={setValue} min={1} max={20} />
    </Preview>
  );
}

export function QuantitySelectorStates() {
  const [value, setValue] = useState(1);
  return (
    <Preview>
      <QuantitySelector value={1} onChange={() => {}} disabled />
      <QuantitySelector value={value} onChange={setValue} min={1} max={5} />
    </Preview>
  );
}
