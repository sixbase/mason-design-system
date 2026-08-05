import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

function ShippingOptions(props: React.ComponentProps<typeof RadioGroup>) {
  return (
    <RadioGroup label="Shipping method" {...props}>
      <RadioGroupItem value="standard" label="Standard" />
      <RadioGroupItem value="express" label="Express" />
      <RadioGroupItem value="overnight" label="Overnight" />
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('renders a radiogroup', () => {
    render(<ShippingOptions />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders one radio per item', () => {
    render(<ShippingOptions />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('names the group via its label', () => {
    render(<ShippingOptions />);
    expect(screen.getByRole('radiogroup', { name: 'Shipping method' })).toBeInTheDocument();
  });

  it('associates item labels with radios', () => {
    render(<ShippingOptions />);
    expect(screen.getByRole('radio', { name: 'Standard' })).toBeInTheDocument();
  });

  it('renders item description and associates it via aria-describedby', () => {
    render(
      <RadioGroup label="Shipping method">
        <RadioGroupItem value="standard" label="Standard" description="4–7 business days" />
      </RadioGroup>,
    );
    const radio = screen.getByRole('radio', { name: 'Standard' });
    const descriptionId = radio.getAttribute('aria-describedby');
    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId!)).toHaveTextContent('4–7 business days');
  });

  it('renders group hint text', () => {
    render(<ShippingOptions hint="Delivery times exclude weekends" />);
    expect(screen.getByText('Delivery times exclude weekends')).toBeInTheDocument();
  });

  it('renders group error with role alert', () => {
    render(<ShippingOptions error="Please choose a shipping method" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Please choose a shipping method');
  });

  it('hides hint when error is present', () => {
    render(<ShippingOptions hint="Pick one" error="Required" />);
    expect(screen.queryByText('Pick one')).not.toBeInTheDocument();
  });

  it('sets aria-invalid on the group when error is present', () => {
    render(<ShippingOptions error="Required" />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
  });

  it('respects defaultValue', () => {
    render(<ShippingOptions defaultValue="express" />);
    expect(screen.getByRole('radio', { name: 'Express' })).toBeChecked();
  });

  it('selects an item by clicking its label', async () => {
    const user = userEvent.setup();
    render(<ShippingOptions />);
    await user.click(screen.getByText('Express'));
    expect(screen.getByRole('radio', { name: 'Express' })).toBeChecked();
  });

  it('fires onValueChange when a selection is made', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ShippingOptions onValueChange={onValueChange} />);
    await user.click(screen.getByRole('radio', { name: 'Overnight' }));
    expect(onValueChange).toHaveBeenCalledWith('overnight');
  });

  it('moves focus with arrow keys', async () => {
    const user = userEvent.setup();
    render(<ShippingOptions defaultValue="standard" />);
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Standard' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Express' })).toHaveFocus();
  });

  it('disables all items when the group is disabled', () => {
    render(<ShippingOptions disabled />);
    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });

  it('does not fire onValueChange when disabled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ShippingOptions disabled onValueChange={onValueChange} />);
    await user.click(screen.getByRole('radio', { name: 'Standard' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('applies size class to items', () => {
    render(
      <RadioGroup label="Sizes" size="sm">
        <RadioGroupItem value="a" label="Option A" />
      </RadioGroup>,
    );
    expect(document.querySelector('.ds-radio-item-circle--sm')).toBeInTheDocument();
  });

  it('sets orientation on the group', () => {
    render(<ShippingOptions orientation="horizontal" />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <RadioGroup label="Shipping method" defaultValue="standard">
          <RadioGroupItem value="standard" label="Standard" description="4–7 business days" />
          <RadioGroupItem value="express" label="Express" description="1–2 business days" />
        </RadioGroup>
        <RadioGroup label="Billing" error="Please choose a billing option">
          <RadioGroupItem value="card" label="Card" />
          <RadioGroupItem value="paypal" label="PayPal" />
        </RadioGroup>
        <RadioGroup label="Frequency" disabled>
          <RadioGroupItem value="weekly" label="Weekly" />
        </RadioGroup>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
