import { RadioGroup, RadioGroupItem } from '@ds/components';
import { Preview } from './Preview';

export function RadioGroupDefault() {
  return (
    <Preview stack>
      <RadioGroup label="Shipping method" defaultValue="standard">
        <RadioGroupItem value="standard" label="Standard" />
        <RadioGroupItem value="express" label="Express" />
        <RadioGroupItem value="overnight" label="Overnight" />
      </RadioGroup>
    </Preview>
  );
}

export function RadioGroupWithDescriptions() {
  return (
    <Preview stack>
      <RadioGroup label="Shipping method" defaultValue="standard">
        <RadioGroupItem value="standard" label="Standard" description="4–7 business days · Free" />
        <RadioGroupItem value="express" label="Express" description="1–2 business days · $12.00" />
        <RadioGroupItem value="overnight" label="Overnight" description="Next business day · $28.00" />
      </RadioGroup>
    </Preview>
  );
}

export function RadioGroupWithText() {
  return (
    <Preview stack>
      <RadioGroup
        label="Delivery frequency"
        hint="You can change this any time"
        defaultValue="monthly"
      >
        <RadioGroupItem value="weekly" label="Every week" />
        <RadioGroupItem value="monthly" label="Every month" />
        <RadioGroupItem value="quarterly" label="Every 3 months" />
      </RadioGroup>
      <RadioGroup label="Payment method" error="Please choose a payment method">
        <RadioGroupItem value="card" label="Credit card" />
        <RadioGroupItem value="paypal" label="PayPal" />
        <RadioGroupItem value="applepay" label="Apple Pay" />
      </RadioGroup>
    </Preview>
  );
}

export function RadioGroupStates() {
  return (
    <Preview stack>
      <RadioGroup label="Disabled group" disabled defaultValue="standard">
        <RadioGroupItem value="standard" label="Standard" />
        <RadioGroupItem value="express" label="Express" />
      </RadioGroup>
      <RadioGroup label="Disabled item" defaultValue="standard">
        <RadioGroupItem value="standard" label="Standard" />
        <RadioGroupItem value="overnight" label="Overnight" disabled />
      </RadioGroup>
    </Preview>
  );
}

export function RadioGroupLayouts() {
  return (
    <Preview stack>
      <RadioGroup label="Sort by (size=sm)" size="sm" defaultValue="featured">
        <RadioGroupItem value="featured" label="Featured" />
        <RadioGroupItem value="price-asc" label="Price: low to high" />
        <RadioGroupItem value="price-desc" label="Price: high to low" />
      </RadioGroup>
      <RadioGroup label="Condition (horizontal)" orientation="horizontal" defaultValue="new">
        <RadioGroupItem value="new" label="New" />
        <RadioGroupItem value="refurbished" label="Refurbished" />
        <RadioGroupItem value="used" label="Used" />
      </RadioGroup>
    </Preview>
  );
}
