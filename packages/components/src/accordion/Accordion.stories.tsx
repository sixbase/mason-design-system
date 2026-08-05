import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    flush: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  args: {
    type: 'single',
    collapsible: true,
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping & Delivery</AccordionTrigger>
        <AccordionContent>
          Free standard shipping on orders over $50. Express shipping available for $9.99.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns & Exchanges</AccordionTrigger>
        <AccordionContent>
          We accept returns within 30 days of purchase. Items must be unused and in original packaging.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="warranty">
        <AccordionTrigger>Warranty</AccordionTrigger>
        <AccordionContent>
          All products come with a 1-year manufacturer warranty against defects.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const DisabledItem: Story = {
  args: {
    type: 'single',
    collapsible: true,
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping & Delivery</AccordionTrigger>
        <AccordionContent>
          Free standard shipping on orders over $50.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="preorders" disabled>
        <AccordionTrigger>Pre-orders (coming soon)</AccordionTrigger>
        <AccordionContent>
          Pre-order details will be published closer to launch.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns & Exchanges</AccordionTrigger>
        <AccordionContent>
          We accept returns within 30 days of purchase.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  args: {
    type: 'multiple',
    defaultValue: ['features'],
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="features">
        <AccordionTrigger>Features</AccordionTrigger>
        <AccordionContent>Built-in keyboard navigation, screen reader support, and animation.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="specs">
        <AccordionTrigger>Specifications</AccordionTrigger>
        <AccordionContent>Supports single and multiple expand modes with customizable sizes.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <p style={{ marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-semibold)' }}>Size: {size}</p>
          <Accordion type="single" collapsible size={size}>
            <AccordionItem value="item">
              <AccordionTrigger>Accordion trigger ({size})</AccordionTrigger>
              <AccordionContent>Content for the {size} size variant.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
    </div>
  ),
};

export const Flush: Story = {
  args: {
    type: 'single',
    collapsible: true,
    flush: true,
  },
  render: (args) => (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 var(--spacing-4)' }}>
      <Accordion {...args}>
        <AccordionItem value="a">
          <AccordionTrigger>First item (no top border)</AccordionTrigger>
          <AccordionContent>Content A</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Last item (no bottom border)</AccordionTrigger>
          <AccordionContent>Content B</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

// ─── Checkbox variant ───────────────────────────────────

export const WithCheckbox: Story = {
  render: () => {
    const [checked, setChecked] = useState<Record<string, boolean>>({
      essential: true,
      functional: false,
      performance: false,
      targeting: false,
    });

    return (
      <Accordion type="multiple" size="sm">
        <AccordionItem value="essential">
          <AccordionTrigger
            checked={checked.essential}
            checkboxDisabled
            checkboxLabel="Strictly Necessary Cookies"
          >
            Strictly Necessary Cookies
          </AccordionTrigger>
          <AccordionContent>
            These cookies are essential for the website to function and cannot be switched off.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="functional">
          <AccordionTrigger
            checked={checked.functional}
            onCheckedChange={(c) => setChecked((s) => ({ ...s, functional: c === true }))}
            checkboxLabel="Functional Cookies"
          >
            Functional Cookies
          </AccordionTrigger>
          <AccordionContent>
            These cookies enable enhanced functionality and personalization.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="performance">
          <AccordionTrigger
            checked={checked.performance}
            onCheckedChange={(c) => setChecked((s) => ({ ...s, performance: c === true }))}
            checkboxLabel="Performance Cookies"
          >
            Performance Cookies
          </AccordionTrigger>
          <AccordionContent>
            These cookies help us understand how visitors interact with the website.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="targeting">
          <AccordionTrigger
            checked={checked.targeting}
            onCheckedChange={(c) => setChecked((s) => ({ ...s, targeting: c === true }))}
            checkboxLabel="Targeting Cookies"
          >
            Targeting Cookies
          </AccordionTrigger>
          <AccordionContent>
            These cookies are used to deliver personalized advertisements.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  },
};
