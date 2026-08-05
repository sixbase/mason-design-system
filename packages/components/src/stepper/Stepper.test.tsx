import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Step, Stepper } from './Stepper';

function renderCheckout(activeStep: number, onStepClick?: (index: number) => void) {
  return render(
    <Stepper activeStep={activeStep} onStepClick={onStepClick} label="Checkout progress">
      <Step label="Cart" />
      <Step label="Shipping" />
      <Step label="Payment" />
      <Step label="Review" />
    </Stepper>,
  );
}

describe('Stepper', () => {
  it('renders a navigation landmark with an accessible name', () => {
    renderCheckout(1);
    expect(screen.getByRole('navigation', { name: 'Checkout progress' })).toBeInTheDocument();
  });

  it('defaults the navigation label to "Progress"', () => {
    render(
      <Stepper activeStep={0}>
        <Step label="Cart" />
        <Step label="Shipping" />
      </Stepper>,
    );
    expect(screen.getByRole('navigation', { name: 'Progress' })).toBeInTheDocument();
  });

  it('renders steps as an ordered list', () => {
    renderCheckout(1);
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
  });

  it('marks the active step with aria-current="step"', () => {
    renderCheckout(1);
    const items = screen.getAllByRole('listitem');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[0]).not.toHaveAttribute('aria-current');
    expect(items[2]).not.toHaveAttribute('aria-current');
  });

  it('applies completed, active, and upcoming state classes', () => {
    renderCheckout(1);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveClass('ds-stepper__step--completed');
    expect(items[1]).toHaveClass('ds-stepper__step--active');
    expect(items[2]).toHaveClass('ds-stepper__step--upcoming');
    expect(items[3]).toHaveClass('ds-stepper__step--upcoming');
  });

  it('shows a check icon on completed steps', () => {
    renderCheckout(2);
    const items = screen.getAllByRole('listitem');
    expect(items[0].querySelector('svg')).toBeInTheDocument();
    expect(items[1].querySelector('svg')).toBeInTheDocument();
    expect(items[2].querySelector('svg')).not.toBeInTheDocument();
  });

  it('shows step numbers on active and upcoming steps', () => {
    renderCheckout(1);
    const items = screen.getAllByRole('listitem');
    expect(items[1].querySelector('.ds-stepper__indicator')).toHaveTextContent('2');
    expect(items[2].querySelector('.ds-stepper__indicator')).toHaveTextContent('3');
  });

  it('adds screen-reader completed text to completed steps', () => {
    renderCheckout(1);
    const items = screen.getAllByRole('listitem');
    expect(within(items[0]).getByText('(completed)')).toHaveClass('ds-stepper__sr-only');
  });

  it('does not render buttons without onStepClick', () => {
    renderCheckout(2);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('makes only completed steps clickable with onStepClick', () => {
    renderCheckout(2, vi.fn());
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('Cart');
    expect(buttons[1]).toHaveTextContent('Shipping');
  });

  it('never makes the active or upcoming steps clickable', () => {
    renderCheckout(1, vi.fn());
    const items = screen.getAllByRole('listitem');
    expect(within(items[1]).queryByRole('button')).not.toBeInTheDocument();
    expect(within(items[2]).queryByRole('button')).not.toBeInTheDocument();
  });

  it('fires onStepClick with the step index when a completed step is clicked', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    renderCheckout(2, onStepClick);
    await user.click(screen.getByRole('button', { name: /Shipping/ }));
    expect(onStepClick).toHaveBeenCalledWith(1);
  });

  it('supports keyboard activation of completed steps', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    renderCheckout(1, onStepClick);
    await user.tab();
    expect(screen.getByRole('button', { name: /Cart/ })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it('uses type="button" on clickable steps', () => {
    renderCheckout(1, vi.fn());
    expect(screen.getByRole('button', { name: /Cart/ })).toHaveAttribute('type', 'button');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Stepper activeStep={1} label="Checkout progress">
          <Step label="Cart" />
          <Step label="Shipping" />
          <Step label="Payment" />
        </Stepper>
        <Stepper activeStep={2} onStepClick={() => {}} label="Order progress">
          <Step label="Cart" />
          <Step label="Shipping" />
          <Step label="Payment" />
          <Step label="Review" />
        </Stepper>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
