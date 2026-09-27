import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VariantSelector } from './VariantSelector';
import type { VariantOption } from './VariantSelector';

const meta: Meta<typeof VariantSelector> = {
  title: 'Ecommerce/VariantSelector',
  component: VariantSelector,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Picks a product’s options — colour swatches and size or material buttons — on the product page.',
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

/** A product-page column: full width on phones, form width on desktop. */
const column = { width: '100%', maxWidth: 'var(--size-modal-sm)' };

export const Default: Story = {
  render: () => (
    <div style={column}>
      <InteractiveVariantSelector
        options={[colorOption, sizeOption]}
        initialValues={{ Color: 'carbon-black', Size: 'm' }}
      />
    </div>
  ),
};

export const Small: Story = {
  render: () => (
    <div style={column}>
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
    <div style={column}>
      <InteractiveVariantSelector
        options={[colorOption, sizeOption, materialOption]}
        initialValues={{ Color: 'bone-white', Size: 's', Material: 'linen' }}
      />
    </div>
  ),
};

/** Out-of-stock sizes stay choosable (shown crossed through) so shoppers can still see them. */
export const WithUnavailableOptions: Story = {
  name: 'Some sizes out of stock',
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
      <div style={column}>
        <InteractiveVariantSelector
          options={[colorOption, sizeWithStock]}
          initialValues={{ Color: 'carbon-black', Size: 'm' }}
        />
      </div>
    );
  },
};

export const WithUnavailableColors: Story = {
  name: 'Some colours out of stock',
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
      <div style={column}>
        <InteractiveVariantSelector
          options={[colorWithStock]}
          initialValues={{ Color: 'carbon-black' }}
        />
      </div>
    );
  },
};

/** Disabled options can't be chosen at all — for combinations that don't exist. */
export const WithDisabledOptions: Story = {
  name: 'An option that doesn’t exist',
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
      <div style={column}>
        <InteractiveVariantSelector
          options={[sizeWithDisabled]}
          initialValues={{ Size: 'm' }}
        />
      </div>
    );
  },
};

export const ButtonOnlyOptions: Story = {
  name: 'Buttons only (no colours)',
  render: () => (
    <div style={column}>
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
      <div style={column}>
        <InteractiveVariantSelector
          options={[materialLong]}
          initialValues={{ Material: 'leather' }}
        />
      </div>
    );
  },
};

export const SingleValue: Story = {
  name: 'Only one choice',
  render: () => {
    const singleOption: VariantOption = {
      name: 'Style',
      type: 'button',
      values: [{ label: 'Classic', value: 'classic' }],
    };

    return (
      <div style={column}>
        <InteractiveVariantSelector
          options={[singleOption]}
          initialValues={{ Style: 'classic' }}
        />
      </div>
    );
  },
};
