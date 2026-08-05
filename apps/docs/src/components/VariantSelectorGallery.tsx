import { useState } from 'react';
import { VariantSelector, Heading, Text } from '@ds/components';
import type { VariantOption } from '@ds/components';

const colorOption: VariantOption = {
  name: 'Color',
  type: 'color',
  values: [
    { label: 'Carbon Black', value: 'carbon-black', colorHex: '#1A1A1A' },
    { label: 'Bone White', value: 'bone-white', colorHex: '#F5F0E8' },
    { label: 'Navy Blue', value: 'navy-blue', colorHex: '#1B2A4A' },
    { label: 'Forest Green', value: 'forest-green', colorHex: '#2D4A2D' },
  ],
};

const sizeOption: VariantOption = {
  name: 'Size',
  type: 'button',
  values: [
    { label: 'XS', value: 'xs' },
    { label: 'S', value: 's' },
    { label: 'M', value: 'm' },
    { label: 'L', value: 'l' },
    { label: 'XL', value: 'xl' },
    { label: 'XXL', value: 'xxl' },
  ],
};

const materialOption: VariantOption = {
  name: 'Material',
  type: 'button',
  values: [
    { label: 'Cotton', value: 'cotton' },
    { label: 'Linen', value: 'linen' },
    { label: 'Silk', value: 'silk' },
  ],
};

const sizeWithStock: VariantOption = {
  name: 'Size',
  type: 'button',
  values: [
    { label: 'XS', value: 'xs', available: false },
    { label: 'S', value: 's' },
    { label: 'M', value: 'm' },
    { label: 'L', value: 'l' },
    { label: 'XL', value: 'xl', available: false },
    { label: 'XXL', value: 'xxl', available: false },
  ],
};

function InteractiveDemo({
  options,
  initialValues,
  size,
}: {
  options: VariantOption[];
  initialValues: Record<string, string>;
  size?: 'sm' | 'md';
}) {
  const [selected, setSelected] = useState(initialValues);
  return (
    <VariantSelector
      options={options}
      selectedValues={selected}
      onValueChange={(name, value) =>
        setSelected((prev) => ({ ...prev, [name]: value }))
      }
      size={size}
    />
  );
}

export function VariantSelectorGallery() {
  return (
    <div className="demo-stack">
      <section className="demo-section">
        <Heading as="h2">Default</Heading>
        <Text>Color swatches and size buttons — the most common PDP combination.</Text>
        <div className="demo-preview" style={{ maxWidth: '360px' }}>
          <InteractiveDemo
            options={[colorOption, sizeOption]}
            initialValues={{ Color: 'carbon-black', Size: 'm' }}
          />
        </div>
      </section>

      <section className="demo-section">
        <Heading as="h2">Multiple Option Groups</Heading>
        <Text>Three option types: color, size, and material.</Text>
        <div className="demo-preview" style={{ maxWidth: '360px' }}>
          <InteractiveDemo
            options={[colorOption, sizeOption, materialOption]}
            initialValues={{ Color: 'bone-white', Size: 's', Material: 'linen' }}
          />
        </div>
      </section>

      <section className="demo-section">
        <Heading as="h2">Small Size</Heading>
        <Text>Compact variant for tighter layouts.</Text>
        <div className="demo-preview" style={{ maxWidth: '320px' }}>
          <InteractiveDemo
            options={[colorOption, sizeOption]}
            initialValues={{ Color: 'navy-blue', Size: 'l' }}
            size="sm"
          />
        </div>
      </section>

      <section className="demo-section">
        <Heading as="h2">With Unavailable Options</Heading>
        <Text>Out-of-stock sizes shown with reduced opacity and strikethrough. Still clickable per Shopify convention.</Text>
        <div className="demo-preview" style={{ maxWidth: '360px' }}>
          <InteractiveDemo
            options={[colorOption, sizeWithStock]}
            initialValues={{ Color: 'carbon-black', Size: 'm' }}
          />
        </div>
      </section>

      <section className="demo-section">
        <Heading as="h2">With Unavailable Colors</Heading>
        <Text>Out-of-stock color swatches get a diagonal strikethrough — unavailability is never communicated by opacity alone. Still clickable per Shopify convention.</Text>
        <div className="demo-preview" style={{ maxWidth: '360px' }}>
          <InteractiveDemo
            options={[
              {
                name: 'Color',
                type: 'color',
                values: [
                  { label: 'Carbon Black', value: 'carbon-black', colorHex: '#1A1A1A' },
                  { label: 'Bone White', value: 'bone-white', colorHex: '#F5F0E8', available: false },
                  { label: 'Navy Blue', value: 'navy-blue', colorHex: '#1B2A4A' },
                  { label: 'Forest Green', value: 'forest-green', colorHex: '#2D4A2D', available: false },
                ],
              },
            ]}
            initialValues={{ Color: 'carbon-black' }}
          />
        </div>
      </section>

      <section className="demo-section">
        <Heading as="h2">Button-Only Options</Heading>
        <Text>When there are no color options — just text-based selectors.</Text>
        <div className="demo-preview" style={{ maxWidth: '360px' }}>
          <InteractiveDemo
            options={[sizeOption, materialOption]}
            initialValues={{ Size: 'l', Material: 'cotton' }}
          />
        </div>
      </section>
    </div>
  );
}
