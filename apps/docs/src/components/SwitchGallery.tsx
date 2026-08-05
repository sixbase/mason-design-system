import { Switch } from '@ds/components';
import { Preview } from './Preview';

export function SwitchStates() {
  return (
    <Preview stack>
      <Switch label="Off (Default)" />
      <Switch label="On" defaultChecked />
      <Switch label="Disabled" disabled />
      <Switch label="Disabled on" disabled defaultChecked />
    </Preview>
  );
}

export function SwitchWithText() {
  return (
    <Preview stack>
      <Switch
        label="Gift wrapping"
        hint="Adds $5.00 at checkout"
      />
      <Switch
        label="I accept the subscription terms"
        error="You must enable this to continue"
      />
    </Preview>
  );
}

export function SwitchSizes() {
  return (
    <Preview stack>
      <Switch size="md" label="Medium (default)" defaultChecked />
      <Switch size="sm" label="Small" defaultChecked />
    </Preview>
  );
}

export function SwitchSettings() {
  return (
    <Preview stack>
      <Switch label="Order updates" defaultChecked hint="Shipping and delivery notifications" />
      <Switch label="Restock alerts" hint="When wishlist items are back in stock" />
      <Switch label="Promotions" hint="Sales, discounts, and early access" />
      <Switch label="SMS notifications" disabled hint="Add a phone number to enable" />
    </Preview>
  );
}
