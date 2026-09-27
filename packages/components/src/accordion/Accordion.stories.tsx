import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './Accordion';
import { Text } from '../typography/Typography';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Questions and details that open one at a time — shipping, returns, care. Only the headings show until you open one.',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    bordered: { control: 'boolean' },
    flush: { table: { disable: true } },
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

export const Multiple: Story = {
  name: 'Several open at once',
  args: {
    type: 'multiple',
    defaultValue: ['features'],
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="features">
        <AccordionTrigger>Materials</AccordionTrigger>
        <AccordionContent>12 oz organic cotton canvas, vegetable-tanned leather handles, solid brass rivets.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="specs">
        <AccordionTrigger>Care</AccordionTrigger>
        <AccordionContent>Spot clean with a damp cloth. Condition the handles twice a year. Do not machine wash.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

/** `bordered` puts the accordion in its own rounded panel (e.g. inside a card or sidebar). */
export const Bordered: Story = {
  args: {
    type: 'single',
    collapsible: true,
    bordered: true,
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping & Delivery</AccordionTrigger>
        <AccordionContent>Free standard shipping on orders over $50.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns & Exchanges</AccordionTrigger>
        <AccordionContent>Returns are free within 30 days of delivery.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithCheckbox: Story = {
  name: 'With checkboxes (cookie preferences)',
  render: function WithCheckboxStory() {
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

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
      {([
        ['sm', 'Small'],
        ['md', 'Medium (default)'],
        ['lg', 'Large'],
      ] as const).map(([size, name]) => (
        <div key={size}>
          <Text size="sm" muted style={{ marginBottom: 'var(--spacing-2)' }}>{name}</Text>
          <Accordion type="single" collapsible size={size}>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping & Delivery</AccordionTrigger>
              <AccordionContent>Free standard shipping on orders over $50.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionTrigger>Returns & Exchanges</AccordionTrigger>
              <AccordionContent>Returns are free within 30 days of delivery.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
    </div>
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
