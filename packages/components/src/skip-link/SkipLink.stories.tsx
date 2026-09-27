import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useRef } from 'react';
import { Text } from '../typography/Typography';
import { SkipLink } from './SkipLink';

const meta: Meta<typeof SkipLink> = {
  title: 'Components/SkipLink',
  component: SkipLink,
  parameters: {
    docs: {
      description: {
        component:
          'A hidden “Skip to content” link that appears when a keyboard user presses Tab.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof SkipLink>;

/* ─── Default ──────────────────────────────────────────────────── */
/* The link is visually hidden until it receives keyboard focus —
   click inside the canvas, then press Tab to reveal it. */

export const Default: Story = {
  render: () => (
    <div>
      <SkipLink />
      <Text size="sm">
        Click here, then press Tab — the skip link appears fixed at the
        top-left of the viewport.
      </Text>
    </div>
  ),
};

export const CustomTarget: Story = {
  render: () => (
    <div>
      <SkipLink href="#product-list">Skip to products</SkipLink>
      <Text size="sm">
        Custom target and label: press Tab to reveal “Skip to products”.
      </Text>
    </div>
  ),
};

/**
 * Focused on load, so its look can be checked without pressing Tab. It
 * shows at the top-left of the screen (where it would on a real page) and
 * hides again as soon as focus moves on.
 */
export const Focused: Story = {
  name: 'As it looks after pressing Tab',
  parameters: { docs: { story: { inline: false, iframeHeight: 160 } } },
  render: function FocusedStory() {
    const ref = useRef<HTMLAnchorElement>(null);
    useEffect(() => {
      ref.current?.focus({ preventScroll: true });
    }, []);
    return (
      <div>
        <SkipLink ref={ref} />
        <Text size="sm">
          The link is focused — it sits at the top-left of the screen until you click or tab away.
        </Text>
      </div>
    );
  },
};
