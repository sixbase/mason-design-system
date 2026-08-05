import { useState } from 'react';
import { Step, Stepper } from '@ds/components';

export function StepperDefault() {
  return (
    <Stepper activeStep={1} label="Checkout progress">
      <Step label="Cart" />
      <Step label="Shipping" />
      <Step label="Payment" />
      <Step label="Review" />
    </Stepper>
  );
}

export function StepperStates() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
      <Stepper activeStep={0} label="Checkout progress — first step">
        <Step label="Cart" />
        <Step label="Shipping" />
        <Step label="Payment" />
        <Step label="Review" />
      </Stepper>
      <Stepper activeStep={3} label="Checkout progress — last step">
        <Step label="Cart" />
        <Step label="Shipping" />
        <Step label="Payment" />
        <Step label="Review" />
      </Stepper>
    </div>
  );
}

export function StepperClickable() {
  const [activeStep, setActiveStep] = useState(2);
  return (
    <Stepper activeStep={activeStep} onStepClick={setActiveStep} label="Checkout progress">
      <Step label="Cart" />
      <Step label="Shipping" />
      <Step label="Payment" />
      <Step label="Review" />
    </Stepper>
  );
}

export function StepperOrderTracking() {
  return (
    <Stepper activeStep={2} label="Order progress">
      <Step label="Ordered" />
      <Step label="Shipped" />
      <Step label="Out for delivery" />
      <Step label="Delivered" />
    </Stepper>
  );
}
