import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A list where you pick exactly one option — shipping speed, payment method.',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
  },
};
export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup label="Shipping method" defaultValue="standard" {...args}>
      <RadioGroupItem value="standard" label="Standard" />
      <RadioGroupItem value="express" label="Express" />
      <RadioGroupItem value="overnight" label="Overnight" />
    </RadioGroup>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <RadioGroup label="Shipping method" defaultValue="standard">
      <RadioGroupItem value="standard" label="Standard" description="4–7 business days · Free" />
      <RadioGroupItem value="express" label="Express" description="1–2 business days · $12.00" />
      <RadioGroupItem value="overnight" label="Overnight" description="Next business day · $28.00" />
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup label="Condition" orientation="horizontal" defaultValue="new">
      <RadioGroupItem value="new" label="New" />
      <RadioGroupItem value="refurbished" label="Refurbished" />
      <RadioGroupItem value="used" label="Used" />
    </RadioGroup>
  ),
};

export const Small: Story = {
  render: () => (
    <RadioGroup label="Sort by" size="sm" defaultValue="featured">
      <RadioGroupItem value="featured" label="Featured" />
      <RadioGroupItem value="price-asc" label="Price: low to high" />
      <RadioGroupItem value="price-desc" label="Price: high to low" />
      <RadioGroupItem value="newest" label="Newest" />
    </RadioGroup>
  ),
};

export const WithHint: Story = {
  render: () => (
    <RadioGroup label="Delivery frequency" hint="You can change this any time" defaultValue="monthly">
      <RadioGroupItem value="weekly" label="Every week" />
      <RadioGroupItem value="monthly" label="Every month" />
      <RadioGroupItem value="quarterly" label="Every 3 months" />
    </RadioGroup>
  ),
};

export const WithError: Story = {
  render: () => (
    <RadioGroup label="Payment method" error="Please choose a payment method">
      <RadioGroupItem value="card" label="Credit card" />
      <RadioGroupItem value="paypal" label="PayPal" />
      <RadioGroupItem value="applepay" label="Apple Pay" />
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup label="Shipping method" disabled defaultValue="standard">
      <RadioGroupItem value="standard" label="Standard" />
      <RadioGroupItem value="express" label="Express" />
    </RadioGroup>
  ),
};

/** A disabled group keeps its hint readable, so the reason still shows. */
export const DisabledWithHint: Story = {
  render: () => (
    <RadioGroup
      label="Delivery date"
      hint="Scheduled delivery isn’t available for your postcode yet"
      disabled
      defaultValue="asap"
    >
      <RadioGroupItem value="asap" label="As soon as possible" />
      <RadioGroupItem value="scheduled" label="Pick a day" />
    </RadioGroup>
  ),
};

export const DisabledItem: Story = {
  name: 'One option unavailable',
  render: () => (
    <RadioGroup label="Shipping method" defaultValue="standard">
      <RadioGroupItem value="standard" label="Standard" />
      <RadioGroupItem value="express" label="Express" />
      <RadioGroupItem value="overnight" label="Overnight" disabled />
    </RadioGroup>
  ),
};
