import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Step, Stepper } from './Stepper';

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
  tags: ['autodocs'],
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
  render: () => (
    <Stepper activeStep={3} label="Order progress">
      <Step label="Ordered" />
      <Step label="Shipped" />
      <Step label="Delivered" />
    </Stepper>
  ),
};

export const ClickableCompleted: Story = {
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
