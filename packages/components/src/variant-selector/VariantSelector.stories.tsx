import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VariantSelector } from './VariantSelector';
import type { VariantOption } from './VariantSelector';

const meta: Meta<typeof VariantSelector> = {
  title: 'Ecommerce/VariantSelector',
  component: VariantSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Unified variant picker for Shopify product option types. Orchestrates color swatches and button groups for size, material, and style options.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size of the controls',
    },
    options: { table: { disable: true } },
    selectedValues: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof VariantSelector>;

// ─── Sample data ────────────────────────────────────────────

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

// ─── Interactive wrapper ────────────────────────────────────

function InteractiveVariantSelector({
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

// ─── Stories ────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div style={{ width: '320px' }}>
      <InteractiveVariantSelector
        options={[colorOption, sizeOption]}
        initialValues={{ Color: 'carbon-black', Size: 'm' }}
      />
    </div>
  ),
};

export const Small: Story = {
  render: () => (
    <div style={{ width: '280px' }}>
      <InteractiveVariantSelector
        options={[colorOption, sizeOption]}
        initialValues={{ Color: 'navy-blue', Size: 'l' }}
        size="sm"
      />
    </div>
  ),
};

export const MultipleOptionGroups: Story = {
  render: () => (
    <div style={{ width: '320px' }}>
      <InteractiveVariantSelector
        options={[colorOption, sizeOption, materialOption]}
        initialValues={{ Color: 'bone-white', Size: 's', Material: 'linen' }}
      />
    </div>
  ),
};

export const WithUnavailableOptions: Story = {
  render: () => {
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

    return (
      <div style={{ width: '320px' }}>
        <InteractiveVariantSelector
          options={[colorOption, sizeWithStock]}
          initialValues={{ Color: 'carbon-black', Size: 'm' }}
        />
      </div>
    );
  },
};

export const WithUnavailableColors: Story = {
  render: () => {
    const colorWithStock: VariantOption = {
      name: 'Color',
      type: 'color',
      values: [
        { label: 'Carbon Black', value: 'carbon-black', colorHex: '#1A1A1A' },
        { label: 'Bone White', value: 'bone-white', colorHex: '#F5F0E8', available: false },
        { label: 'Navy Blue', value: 'navy-blue', colorHex: '#1B2A4A' },
        { label: 'Forest Green', value: 'forest-green', colorHex: '#2D4A2D', available: false },
      ],
    };

    return (
      <div style={{ width: '320px' }}>
        <InteractiveVariantSelector
          options={[colorWithStock]}
          initialValues={{ Color: 'carbon-black' }}
        />
      </div>
    );
  },
};

export const WithDisabledOptions: Story = {
  render: () => {
    const sizeWithDisabled: VariantOption = {
      name: 'Size',
      type: 'button',
      values: [
        { label: 'S', value: 's' },
        { label: 'M', value: 'm' },
        { label: 'L', value: 'l' },
        { label: 'XL', value: 'xl', disabled: true },
      ],
    };

    return (
      <div style={{ width: '320px' }}>
        <InteractiveVariantSelector
          options={[sizeWithDisabled]}
          initialValues={{ Size: 'm' }}
        />
      </div>
    );
  },
};

export const ButtonOnlyOptions: Story = {
  render: () => (
    <div style={{ width: '320px' }}>
      <InteractiveVariantSelector
        options={[sizeOption, materialOption]}
        initialValues={{ Size: 'l', Material: 'cotton' }}
      />
    </div>
  ),
};

export const LongLabels: Story = {
  render: () => {
    const materialLong: VariantOption = {
      name: 'Material',
      type: 'button',
      values: [
        { label: 'Hand-Stitched Italian Leather', value: 'leather' },
        { label: 'Organic Japanese Cotton', value: 'cotton' },
        { label: 'Recycled Polyester', value: 'polyester' },
      ],
    };

    return (
      <div style={{ width: '320px' }}>
        <InteractiveVariantSelector
          options={[materialLong]}
          initialValues={{ Material: 'leather' }}
        />
      </div>
    );
  },
};

export const SingleValue: Story = {
  render: () => {
    const singleOption: VariantOption = {
      name: 'Style',
      type: 'button',
      values: [{ label: 'Classic', value: 'classic' }],
    };

    return (
      <div style={{ width: '320px' }}>
        <InteractiveVariantSelector
          options={[singleOption]}
          initialValues={{ Style: 'classic' }}
        />
      </div>
    );
  },
};
