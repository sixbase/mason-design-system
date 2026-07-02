import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { FeatureBlock } from './FeatureBlock';

const image = <img src="/images/foundry.jpg" alt="Molten iron being poured in the Mason foundry" />;

describe('FeatureBlock', () => {
  it('renders the title as an h2 heading', () => {
    render(<FeatureBlock title="Cast for a lifetime" description="Every skillet is poured in Ohio." image={image} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Cast for a lifetime' })).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<FeatureBlock title="Title" description="Every skillet is poured in Ohio." image={image} />);
    expect(screen.getByText('Every skillet is poured in Ohio.')).toBeInTheDocument();
  });

  it('renders the image node', () => {
    render(<FeatureBlock title="Title" description="Description" image={image} />);
    expect(screen.getByAltText('Molten iron being poured in the Mason foundry')).toBeInTheDocument();
  });

  it('does not apply reverse class by default', () => {
    const { container } = render(<FeatureBlock title="Title" description="Description" image={image} />);
    expect(container.querySelector('.ds-feature-block--reverse')).not.toBeInTheDocument();
  });

  it('applies reverse class when reverse is set', () => {
    const { container } = render(<FeatureBlock title="Title" description="Description" image={image} reverse />);
    expect(container.querySelector('.ds-feature-block--reverse')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(
      <FeatureBlock title="Title" description="Description" image={image} className="custom" data-testid="block" />,
    );
    expect(screen.getByTestId('block')).toHaveClass('custom', 'ds-feature-block');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<FeatureBlock ref={ref} title="Title" description="Description" image={image} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FeatureBlock
        title="Cast for a lifetime"
        description="Every skillet is poured, seasoned, and inspected in our Ohio foundry."
        image={image}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
