import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Page numbers under a long list, with previous and next.',
      },
    },
  },
  argTypes: {
    currentPage: { control: { type: 'number', min: 1 } },
    totalPages: { control: { type: 'number', min: 1 } },
    siblingCount: { control: { type: 'number', min: 0, max: 3 } },
    size: { control: 'select', options: ['sm', 'md'] },
    onPageChange: { table: { disable: true } },
    baseUrl: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

// ─── Interactive wrapper for SPA demos ─────────────────────

function InteractivePagination(props: {
  totalPages: number;
  siblingCount?: number;
  size?: 'sm' | 'md';
  initialPage?: number;
}) {
  const [page, setPage] = useState(props.initialPage ?? 1);
  return (
    <Pagination
      currentPage={page}
      totalPages={props.totalPages}
      onPageChange={setPage}
      siblingCount={props.siblingCount}
      size={props.size}
    />
  );
}

export const Default: Story = {
  args: {
    currentPage: 5,
    totalPages: 20,
    siblingCount: 1,
    size: 'md',
  },
  render: (args) => (
    <InteractivePagination
      totalPages={args.totalPages!}
      siblingCount={args.siblingCount}
      size={args.size}
      initialPage={args.currentPage}
    />
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      <InteractivePagination totalPages={10} size="sm" initialPage={5} />
      <InteractivePagination totalPages={10} size="md" initialPage={5} />
    </div>
  ),
};

/** With `baseUrl` each page is a real link (…?page=4) that search engines can follow — how the Shopify theme uses it. */
export const SSRMode: Story = {
  name: 'As links (Shopify collection pages)',
  render: () => (
    <Pagination
      currentPage={3}
      totalPages={10}
      baseUrl="/collections/all"
      size="md"
    />
  ),
};

export const FirstPage: Story = {
  render: () => <InteractivePagination totalPages={20} initialPage={1} />,
};

export const LastPage: Story = {
  render: () => <InteractivePagination totalPages={20} initialPage={20} />,
};

export const FewPages: Story = {
  render: () => <InteractivePagination totalPages={5} />,
};

export const TwoPages: Story = {
  render: () => <InteractivePagination totalPages={2} />,
};

export const ManyPages: Story = {
  render: () => <InteractivePagination totalPages={100} initialPage={50} />,
};

export const WiderSiblingCount: Story = {
  name: 'Two pages shown either side',
  render: () => (
    <InteractivePagination totalPages={20} siblingCount={2} initialPage={10} />
  ),
};
