import type { Meta, StoryObj } from '@storybook/react';
import { ImageGallery } from './ImageGallery';

const meta: Meta<typeof ImageGallery> = {
  title: 'Components/ImageGallery',
  component: ImageGallery,
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'select', options: ['eager', 'lazy'] },
  },
};
export default meta;

type Story = StoryObj<typeof ImageGallery>;

const placeholderImages = [
  { src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="%23E3DED6"/><text x="200" y="250" text-anchor="middle" fill="%23847D73" font-size="20">Front</text></svg>', alt: 'Front view' },
  { src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="%23C8C2B8"/><text x="200" y="250" text-anchor="middle" fill="%23675F56" font-size="20">Side</text></svg>', alt: 'Side view' },
  { src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="%23A59E94"/><text x="200" y="250" text-anchor="middle" fill="%23342F2A" font-size="20">Back</text></svg>', alt: 'Back view' },
  { src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="%23847D73"/><text x="200" y="250" text-anchor="middle" fill="%23FAF9F7" font-size="20">Detail</text></svg>', alt: 'Detail view' },
];

export const Default: Story = {
  args: {
    images: placeholderImages,
    aspectRatio: '4/5',
  },
  decorators: [(Story) => <div style={{ maxWidth: 400 }}><Story /></div>],
};

export const ThumbsLeft: Story = {
  args: {
    images: placeholderImages,
    aspectRatio: '4/5',
    thumbnailPosition: 'left',
  },
  decorators: [(Story) => <div style={{ maxWidth: 500 }}><Story /></div>],
};

export const SingleImage: Story = {
  args: {
    images: [placeholderImages[0]],
    aspectRatio: '4/5',
  },
  decorators: [(Story) => <div style={{ maxWidth: 400 }}><Story /></div>],
};

export const SquareRatio: Story = {
  args: {
    images: placeholderImages,
    aspectRatio: '1/1',
  },
  decorators: [(Story) => <div style={{ maxWidth: 400 }}><Story /></div>],
};
