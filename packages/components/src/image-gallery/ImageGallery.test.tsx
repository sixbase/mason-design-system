import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { ImageGallery } from './ImageGallery';

const images = [
  { src: '/img1.jpg', alt: 'Front view' },
  { src: '/img2.jpg', alt: 'Side view' },
  { src: '/img3.jpg', alt: 'Back view' },
];

describe('ImageGallery', () => {
  it('renders main image', () => {
    render(<ImageGallery images={images} />);
    expect(screen.getByAltText('Front view')).toBeInTheDocument();
  });

  it('renders thumbnails for multiple images', () => {
    render(<ImageGallery images={images} />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('hides thumbnails for single image', () => {
    render(<ImageGallery images={[images[0]]} />);
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('switches image on thumbnail click', async () => {
    render(<ImageGallery images={images} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Side view' }));
    expect(screen.getByAltText('Side view')).toBeInTheDocument();
  });

  it('marks active thumbnail with aria-selected', () => {
    render(<ImageGallery images={images} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('supports keyboard navigation with arrow keys', async () => {
    render(<ImageGallery images={images} />);
    const firstTab = screen.getAllByRole('tab')[0];
    firstTab.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByAltText('Side view')).toBeInTheDocument();
  });

  it('supports Home and End keys', async () => {
    render(<ImageGallery images={images} defaultIndex={1} />);
    const tabs = screen.getAllByRole('tab');
    tabs[1].focus();
    await userEvent.keyboard('{End}');
    expect(screen.getByAltText('Back view')).toBeInTheDocument();
    await userEvent.keyboard('{Home}');
    expect(screen.getByAltText('Front view')).toBeInTheDocument();
  });

  it('respects defaultIndex', () => {
    render(<ImageGallery images={images} defaultIndex={2} />);
    expect(screen.getByAltText('Back view')).toBeInTheDocument();
  });

  it('applies custom aspect ratio', () => {
    const { container } = render(<ImageGallery images={images} aspectRatio="1/1" />);
    const main = container.querySelector('.ds-image-gallery__main') as HTMLElement;
    expect(main.style.getPropertyValue('--gallery-ratio')).toBe('1/1');
  });

  it('eager-loads the main image and lazy-loads thumbnails by default', () => {
    render(<ImageGallery images={images} />);
    expect(screen.getByAltText('Front view')).toHaveAttribute('loading', 'eager');
    const thumbImgs = screen
      .getAllByRole('tab')
      .map((tab) => tab.querySelector('img'));
    thumbImgs.forEach((img) => expect(img).toHaveAttribute('loading', 'lazy'));
  });

  it('forwards loading="lazy" to the main image', () => {
    render(<ImageGallery images={images} loading="lazy" />);
    expect(screen.getByAltText('Front view')).toHaveAttribute('loading', 'lazy');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ImageGallery images={images} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
