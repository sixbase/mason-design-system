import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Highlight, Highlights } from './Highlights';

describe('Highlights', () => {
  it('renders children', () => {
    render(
      <Highlights>
        <Highlight title="Cast with intent." description="Poured in Ohio." />
      </Highlights>,
    );
    expect(screen.getByText('Cast with intent.')).toBeInTheDocument();
  });

  it('applies root class and merges custom className', () => {
    render(<Highlights className="custom" data-testid="row" />);
    expect(screen.getByTestId('row')).toHaveClass('ds-highlights', 'custom');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Highlights ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders title and description inline', () => {
    render(<Highlight title="Cast with intent." description="Every piece starts as raw stock." />);
    expect(screen.getByText('Cast with intent.')).toHaveClass('ds-highlights__title');
    expect(screen.getByText('Every piece starts as raw stock.')).toHaveClass('ds-highlights__desc');
  });

  it('omits the text block when no title or description is given', () => {
    const { container } = render(<Highlight />);
    expect(container.querySelector('.ds-highlights__text')).not.toBeInTheDocument();
  });

  it('renders a hidden placeholder when no image is given', () => {
    const { container } = render(<Highlight title="Cast with intent." />);
    const placeholder = container.querySelector('.ds-highlights__placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the image node instead of the placeholder', () => {
    const { container } = render(
      <Highlight image={<img src="/skillet.jpg" alt="Cast iron skillet on a walnut board" />} />,
    );
    expect(screen.getByAltText('Cast iron skillet on a walnut board')).toBeInTheDocument();
    expect(container.querySelector('.ds-highlights__placeholder')).not.toBeInTheDocument();
  });

  it('forwards Highlight ref correctly', () => {
    const ref = { current: null };
    render(<Highlight ref={ref} title="Cast with intent." />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Highlights>
        <Highlight title="Cast with intent." description="Every piece starts as raw stock in our Ohio foundry." />
        <Highlight title="Finished by hand." description="Oiled, buffed, and inspected before it ships." />
        <Highlight
          image={<img src="/skillet.jpg" alt="Cast iron skillet on a walnut board" />}
          title="Built to be used."
          description="Tools that improve with every season."
        />
      </Highlights>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
