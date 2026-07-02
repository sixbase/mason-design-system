import { Divider, Text } from '@ds/components';
import { Preview } from './Preview';

export function DividerDefault() {
  return (
    <Preview stack>
      <Text>Content above the divider</Text>
      <Divider />
      <Text>Content below the divider</Text>
    </Preview>
  );
}

export function DividerVariants() {
  return (
    <Preview stack>
      <Text>Default variant</Text>
      <Divider />
      <Text>Subtle variant</Text>
      <Divider variant="subtle" />
      <Text>End</Text>
    </Preview>
  );
}

export function DividerSpacings() {
  return (
    <Preview stack>
      <Text>No spacing</Text>
      <Divider spacing="none" />
      <Text>Small spacing</Text>
      <Divider spacing="sm" />
      <Text>Medium spacing (default)</Text>
      <Divider spacing="md" />
      <Text>Large spacing</Text>
      <Divider spacing="lg" />
      <Text>End</Text>
    </Preview>
  );
}

export function DividerVertical() {
  return (
    <Preview>
      <div style={{ display: 'flex', alignItems: 'center', height: '48px' }}>
        <span>Left</span>
        <Divider orientation="vertical" />
        <span>Right</span>
      </div>
    </Preview>
  );
}
