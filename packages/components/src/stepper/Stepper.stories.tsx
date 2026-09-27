import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Step, Stepper } from './Stepper';

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Numbered steps across the top of checkout showing where you are.',
      },
    },
  },
  argTypes: {
    activeStep: { control: { type: 'number', min: 0, max: 3 } },
  },
};
export default meta;

type Story = StoryObj<typeof Stepper>;

export const Default: Story = {
  render: (args) => (
    <Stepper {...args}>
      <Step label="Cart" />
      <Step label="Shipping" />
      <Step label="Payment" />
      <Step label="Review" />
    </Stepper>
  ),
  args: { activeStep: 1, label: 'Checkout progress' },
};

export const FirstStep: Story = {
  render: () => (
    <Stepper activeStep={0} label="Checkout progress">
      <Step label="Cart" />
      <Step label="Shipping" />
      <Step label="Payment" />
      <Step label="Review" />
    </Stepper>
  ),
};

export const LastStep: Story = {
  render: () => (
    <Stepper activeStep={3} label="Checkout progress">
      <Step label="Cart" />
      <Step label="Shipping" />
      <Step label="Payment" />
      <Step label="Review" />
    </Stepper>
  ),
};

export const AllCompleted: Story = {
  name: 'All steps done',
  render: () => (
    <Stepper activeStep={3} label="Order progress">
      <Step label="Ordered" />
      <Step label="Shipped" />
      <Step label="Delivered" />
    </Stepper>
  ),
};

/** Finished steps become links back (to fix an address, say); later steps never are. */
export const ClickableCompleted: Story = {
  name: 'Finished steps clickable',
  render: function ClickableStory() {
    const [activeStep, setActiveStep] = useState(2);
    return (
      <Stepper activeStep={activeStep} onStepClick={setActiveStep} label="Checkout progress">
        <Step label="Cart" />
        <Step label="Shipping" />
        <Step label="Payment" />
        <Step label="Review" />
      </Stepper>
    );
  },
};

export const ThreeSteps: Story = {
  render: () => (
    <Stepper activeStep={1} label="Checkout progress">
      <Step label="Information" />
      <Step label="Shipping" />
      <Step label="Payment" />
    </Stepper>
  ),
};
