import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AnnouncementBar } from './AnnouncementBar';

const meta: Meta<typeof AnnouncementBar> = {
  title: 'Components/AnnouncementBar',
  component: AnnouncementBar,
  tags: ['autodocs'],
  argTypes: {
    dismissible: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof AnnouncementBar>;

export const Default: Story = {
  args: {
    children: 'Free shipping on orders over $50.',
  },
};

export const WithLink: Story = {
  args: {
    href: '/collections/sale',
    children: 'Summer sale — 20% off everything. Shop now.',
  },
};

export const Dismissible: Story = {
  render: () => {
    function DismissDemo() {
      const [visible, setVisible] = useState(true);

      if (!visible) {
        return (
          <button
            type="button"
            onClick={() => setVisible(true)}
            style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--font-size-sm)' }}
          >
            Show announcement again
          </button>
        );
      }

      return (
        <AnnouncementBar dismissible onDismiss={() => setVisible(false)}>
          Free returns within 30 days of purchase.
        </AnnouncementBar>
      );
    }
    return <DismissDemo />;
  },
};

export const DismissibleWithLink: Story = {
  render: () => {
    function DismissLinkDemo() {
      const [visible, setVisible] = useState(true);

      if (!visible) {
        return (
          <button
            type="button"
            onClick={() => setVisible(true)}
            style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--font-size-sm)' }}
          >
            Show announcement again
          </button>
        );
      }

      return (
        <AnnouncementBar
          href="/collections/new-arrivals"
          dismissible
          onDismiss={() => setVisible(false)}
        >
          New arrivals just dropped — explore the collection.
        </AnnouncementBar>
      );
    }
    return <DismissLinkDemo />;
  },
};

export const LongMessage: Story = {
  args: {
    children:
      'Due to increased demand, delivery times may be extended by 2–3 business days. We appreciate your patience.',
    dismissible: true,
  },
};
