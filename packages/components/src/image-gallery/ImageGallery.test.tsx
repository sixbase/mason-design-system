import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { ImageGallery } from './ImageGallery';
import type { GalleryImage } from './ImageGallery';

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

  // Regression (a11y audit): the thumbnails were tabs with no tabpanel —
  // no aria-controls, and the main image wasn't a panel named by its tab.
  it('pairs each tab with the main image panel', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={images} />);
    const panel = screen.getByRole('tabpanel');
    const tabs = screen.getAllByRole('tab');
    tabs.forEach((tab) => expect(tab).toHaveAttribute('aria-controls', panel.id));
    expect(panel).toHaveAttribute('aria-labelledby', tabs[0].id);
    expect(panel).toHaveAccessibleName('Front view');
    await user.click(tabs[1]);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', tabs[1].id);
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

  describe('regressions', () => {
    const five = Array.from({ length: 5 }, (_, i) => ({ src: `/v${i}.jpg`, alt: `View ${i + 1}` }));

    it('stays rendered when the image set shrinks below the active index', async () => {
      const { rerender } = render(<ImageGallery images={five} />);
      await userEvent.click(screen.getByRole('tab', { name: 'View 5' }));
      rerender(<ImageGallery images={five.slice(0, 2)} />);
      // Was: images[4] undefined → the whole gallery rendered null.
      // The shown picture is gone, so the set starts over at its first
      // image (round 5 — it used to clamp to the last slot, View 2).
      expect(screen.getByAltText('View 1')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'View 1' })).toHaveAttribute('aria-selected', 'true');
    });

    // Round 5 (shopper journeys): picking another colour swaps the whole
    // image set. The gallery kept the slot number, so with the 4th black
    // photo up, Stone showed its 2nd ("Back") — not the variant's photo.
    const black = ['Front', 'Back', 'Side', 'Detail'].map((v) => ({ src: `/black-${v}.jpg`, alt: `Black ${v}` }));
    const stone = ['Front', 'Back'].map((v) => ({ src: `/stone-${v}.jpg`, alt: `Stone ${v}` }));

    it('shows the first image of a new image set', async () => {
      const { rerender } = render(<ImageGallery images={black} />);
      await userEvent.click(screen.getByRole('tab', { name: 'Black Detail' }));
      rerender(<ImageGallery images={stone} />);
      expect(screen.getByRole('tab', { name: 'Stone Front' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Stone Front');
    });

    it('starts over when switching back to the first set', async () => {
      const { rerender } = render(<ImageGallery images={black} />);
      await userEvent.click(screen.getByRole('tab', { name: 'Black Detail' }));
      rerender(<ImageGallery images={stone} />);
      rerender(<ImageGallery images={black} />);
      expect(screen.getByRole('tab', { name: 'Black Front' })).toHaveAttribute('aria-selected', 'true');
    });

    it('keeps the same picture when it only moves within the set', async () => {
      const { rerender } = render(<ImageGallery images={black} />);
      await userEvent.click(screen.getByRole('tab', { name: 'Black Side' }));
      rerender(<ImageGallery images={[black[2]!, black[0]!, black[1]!]} />);
      expect(screen.getByRole('tab', { name: 'Black Side' })).toHaveAttribute('aria-selected', 'true');
      // A re-render with an equal (new) array keeps the selection too
      rerender(<ImageGallery images={[black[2]!, black[0]!, black[1]!].map((i) => ({ ...i }))} />);
      expect(screen.getByRole('tab', { name: 'Black Side' })).toHaveAttribute('aria-selected', 'true');
    });

    // Regression: goTo was memoised on images.length only, so after a colour
    // switch to a set of the same size it stored the OLD set's picture,
    // which the new set lacks — clicking Stone's 3rd thumb showed its 1st.
    it('shows the clicked picture after switching to a set of the same size', async () => {
      const slate = ['Front', 'Back', 'Side', 'Detail'].map((v) => ({ src: `/slate-${v}.jpg`, alt: `Slate ${v}` }));
      const { rerender } = render(<ImageGallery images={black} />);
      rerender(<ImageGallery images={slate} />);
      await userEvent.click(screen.getByRole('tab', { name: 'Slate Side' }));
      expect(screen.getByRole('tab', { name: 'Slate Side' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Slate Side');
    });

    it('clamps an out-of-range defaultIndex', () => {
      render(<ImageGallery images={images} defaultIndex={9} />);
      expect(screen.getByAltText('Back view')).toBeInTheDocument();
    });

    // Regression: null entries are skipped, and that renumbered the list —
    // defaultIndex (a position in the list as passed) then pointed one
    // image too far for every hole before it.
    describe('defaultIndex with holes in the list', () => {
      const [a, b, c] = images;
      const holey = [a, null, b, c] as unknown as GalleryImage[];

      it('opens on the image the consumer pointed at, past a hole', () => {
        render(<ImageGallery images={holey} defaultIndex={2} />);
        expect(screen.getByRole('tab', { name: 'Side view' })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Side view');
      });

      it('opens on the next real image when defaultIndex points at the hole', () => {
        render(<ImageGallery images={holey} defaultIndex={1} />);
        expect(screen.getByRole('tab', { name: 'Side view' })).toHaveAttribute('aria-selected', 'true');
      });

      it('maps the requested index once images arrive after mount', () => {
        const { rerender } = render(<ImageGallery images={[]} defaultIndex={2} />);
        rerender(<ImageGallery images={holey} defaultIndex={2} />);
        expect(screen.getByRole('tab', { name: 'Side view' })).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('moves focus with the selection on arrow keys', async () => {
      render(<ImageGallery images={images} />);
      const tabs = screen.getAllByRole('tab');
      tabs[0].focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(tabs[1]).toHaveFocus();
      await userEvent.keyboard('{End}');
      expect(tabs[2]).toHaveFocus();
    });

    it('accepts both arrow axes for left thumbnails (horizontal strip below 1024px)', async () => {
      render(<ImageGallery images={images} thumbnailPosition="left" />);
      const tabs = screen.getAllByRole('tab');
      tabs[0].focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
      await userEvent.keyboard('{ArrowDown}');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
    });

    it('RTL: ArrowLeft moves to the next thumbnail (the strip runs right-to-left)', async () => {
      render(
        <div dir="rtl">
          <ImageGallery images={images} />
        </div>,
      );
      const tabs = screen.getAllByRole('tab');
      tabs[0].focus();
      // Was: ArrowLeft → index −1, clamped to 0 — no way forward by the visual key.
      await userEvent.keyboard('{ArrowLeft}');
      expect(tabs[1]).toHaveFocus();
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
      await userEvent.keyboard('{ArrowRight}');
      expect(tabs[0]).toHaveFocus();
    });

    it('names thumbnails whose image has empty alt', async () => {
      const { container } = render(
        <ImageGallery images={[{ src: '/a.jpg', alt: '' }, { src: '/b.jpg', alt: '' }]} />,
      );
      expect(screen.getByRole('tab', { name: 'Image 2 of 2' })).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('only marks the main image swipeable when there is more than one image', () => {
      const { container, rerender } = render(<ImageGallery images={[images[0]]} />);
      expect(container.querySelector('.ds-image-gallery__main--swipeable')).toBeNull();
      rerender(<ImageGallery images={images} />);
      expect(container.querySelector('.ds-image-gallery__main--swipeable')).toBeInTheDocument();
    });
  });
});
