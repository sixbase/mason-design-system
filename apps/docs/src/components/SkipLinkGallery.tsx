import { SkipLink, Text } from '@ds/components';
import { Preview } from './Preview';

export function SkipLinkDefault() {
  return (
    <Preview>
      <div>
        <SkipLink />
        <Text size="sm">
          Click inside this preview, then press Tab — the skip link appears
          fixed at the top-left of the viewport.
        </Text>
      </div>
    </Preview>
  );
}

export function SkipLinkCustom() {
  return (
    <Preview>
      <div>
        <SkipLink href="#product-list">Skip to products</SkipLink>
        <Text size="sm">
          Custom target and label: press Tab to reveal “Skip to products”.
        </Text>
      </div>
    </Preview>
  );
}
