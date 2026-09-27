import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The trail of links above a page title showing where you are: Home › Bags › Canvas Tote.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Bags', href: '/collections/bags' },
      { label: 'Minimal Canvas Tote' },
    ],
  },
};

export const TwoLevels: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'All products' },
    ],
  },
};

/** The default mark is “›”; any other character or icon can replace it. */
export const CustomSeparator: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Kitchen', href: '/collections/kitchen' },
      { label: 'Handmade Ceramic Mug' },
    ],
    separator: '/',
  },
};

/* Deep trail with maxItems: below 768px the middle crumbs fold into "…"
   and the current page truncates on one line; from 768px every crumb shows. */

/**
 * `schema` also writes the trail as search-engine data (a hidden JSON-LD
 * script), so Google can show “Home › Bags › …” under the result. It looks
 * exactly like Default — check the page source, not the pixels.
 */
export const WithSearchData: Story = {
  name: 'With search-result data (looks the same)',
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Bags', href: '/collections/bags' },
      { label: 'Minimal Canvas Tote' },
    ],
    schema: 'https://masonsupply.co',
  },
};

export const Collapsed: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Collections', href: '/collections' },
      { label: 'Kitchen', href: '/collections/kitchen' },
      { label: 'Cookware', href: '/collections/kitchen/cookware' },
      { label: 'Hand-Forged Carbon Steel Skillet, 12 inch' },
    ],
    maxItems: 3,
  },
};
