import { Checkbox, Text } from '@ds/components';
import { Preview } from './Preview';

export function CheckboxStates() {
  return (
    <Preview stack>
      <Checkbox label="Unchecked (Default)" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Indeterminate" checked="indeterminate" />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled checked" disabled defaultChecked />
    </Preview>
  );
}

export function CheckboxWithText() {
  return (
    <Preview stack>
      <Checkbox
        label="Subscribe to newsletter"
        hint="We send at most one email per week"
      />
      <Checkbox
        label="I agree to the terms and conditions"
        error="You must accept the terms to continue"
      />
    </Preview>
  );
}

export function CheckboxFilter() {
  return (
    <Preview stack>
      <div className="ds-gallery-stack">
        <Text size="sm" className="ds-demo-section-label">
          Size
        </Text>
        <Checkbox size="sm" label="XS" defaultChecked />
        <Checkbox size="sm" label="S" defaultChecked />
        <Checkbox size="sm" label="M" />
        <Checkbox size="sm" label="L" />
        <Checkbox size="sm" label="XL" disabled />
      </div>
    </Preview>
  );
}
