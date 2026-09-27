import type { Meta, StoryObj } from '@storybook/react';
import { Select, SelectGroup, SelectItem, SelectSeparator } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A dropdown list for picking one option — size, country, sort order.',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    label: 'Size',
    placeholder: 'Choose a size',
  },
  render: (args) => (
    <Select {...args}>
      <SelectItem value="xs">XS</SelectItem>
      <SelectItem value="sm">SM</SelectItem>
      <SelectItem value="md">MD</SelectItem>
      <SelectItem value="lg">LG</SelectItem>
      <SelectItem value="xl">XL</SelectItem>
    </Select>
  ),
};

export const SortOrder: Story = {
  name: 'With a value chosen',
  render: () => (
    <Select label="Sort by" defaultValue="featured">
      <SelectItem value="featured">Featured</SelectItem>
      <SelectItem value="newest">Newest arrivals</SelectItem>
      <SelectItem value="price-asc">Price: low to high</SelectItem>
      <SelectItem value="price-desc">Price: high to low</SelectItem>
      <SelectItem value="rating">Top rated</SelectItem>
    </Select>
  ),
};

/** A toolbar select with no label on screen still needs a name: pass `aria-label`. */
export const NoVisibleLabel: Story = {
  name: 'No visible label (toolbar)',
  render: () => (
    <Select aria-label="Sort by" defaultValue="featured">
      <SelectItem value="featured">Featured</SelectItem>
      <SelectItem value="newest">Newest arrivals</SelectItem>
      <SelectItem value="price-asc">Price: low to high</SelectItem>
      <SelectItem value="price-desc">Price: high to low</SelectItem>
    </Select>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select label="Category" placeholder="Browse categories">
      <SelectGroup label="Clothing">
        <SelectItem value="tops">Tops</SelectItem>
        <SelectItem value="bottoms">Bottoms</SelectItem>
        <SelectItem value="outerwear">Outerwear</SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup label="Accessories">
        <SelectItem value="bags">Bags</SelectItem>
        <SelectItem value="shoes">Shoes</SelectItem>
        <SelectItem value="jewelry">Jewelry</SelectItem>
      </SelectGroup>
    </Select>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: 'var(--size-modal-sm)' }}>
      <Select label="Shipping method" fullWidth placeholder="Choose shipping">
        <SelectItem value="standard">Standard (5–7 days)</SelectItem>
        <SelectItem value="express">Express (2–3 days)</SelectItem>
        <SelectItem value="overnight">Overnight</SelectItem>
      </Select>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', width: '100%', maxWidth: 'var(--size-modal-sm)' }}>
      {([
        ['sm', 'Small'],
        ['md', 'Medium (default)'],
        ['lg', 'Large'],
      ] as const).map(([size, name]) => (
        <Select key={size} size={size} label={name} defaultValue="oat">
          <SelectItem value="oat">Oat</SelectItem>
          <SelectItem value="charcoal">Charcoal</SelectItem>
          <SelectItem value="sage">Sage</SelectItem>
        </Select>
      ))}
    </div>
  ),
};

export const WithHint: Story = {
  render: () => (
    <Select label="Country" hint="Used for shipping calculations" placeholder="Select country">
      <SelectItem value="us">United States</SelectItem>
      <SelectItem value="ca">Canada</SelectItem>
      <SelectItem value="gb">United Kingdom</SelectItem>
      <SelectItem value="au">Australia</SelectItem>
    </Select>
  ),
};

export const WithError: Story = {
  render: () => (
    <Select label="Size" error="Please select a size to continue" placeholder="Choose a size">
      <SelectItem value="sm">SM</SelectItem>
      <SelectItem value="md">MD</SelectItem>
      <SelectItem value="lg">LG</SelectItem>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select label="Size" disabled placeholder="Out of stock">
      <SelectItem value="sm">SM</SelectItem>
      <SelectItem value="md">MD</SelectItem>
    </Select>
  ),
};

export const DisabledItems: Story = {
  name: 'Some options sold out',
  render: () => (
    <Select label="Size" placeholder="Choose a size">
      <SelectItem value="xs">XS</SelectItem>
      <SelectItem value="sm">SM</SelectItem>
      <SelectItem value="md" disabled>MD (sold out)</SelectItem>
      <SelectItem value="lg">LG</SelectItem>
      <SelectItem value="xl" disabled>XL (sold out)</SelectItem>
    </Select>
  ),
};
