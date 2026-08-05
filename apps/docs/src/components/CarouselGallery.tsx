import { Carousel, CarouselSlide, Text } from '@ds/components';
import { makePlaceholder } from '../lib/placeholder';

export function CarouselDefault() {
  return (
    <Carousel label="Featured products">
      <CarouselSlide>
        <img src={makePlaceholder('Slide 1', '#D6D0C7', '#6B6359')} alt="Slide 1" className="ds-demo-slide-image" />
      </CarouselSlide>
      <CarouselSlide>
        <img src={makePlaceholder('Slide 2', '#C8C1B6', '#5A5248')} alt="Slide 2" className="ds-demo-slide-image" />
      </CarouselSlide>
      <CarouselSlide>
        <img src={makePlaceholder('Slide 3', '#BEB7AC', '#4E473D')} alt="Slide 3" className="ds-demo-slide-image" />
      </CarouselSlide>
    </Carousel>
  );
}

export function CarouselSizes() {
  return (
    <div className="ds-gallery-stack--lg">
      <div>
        <Text size="sm" className="ds-demo-section-label">Small</Text>
        <Carousel label="Small slides example">
          <CarouselSlide size="sm">
            <img src={makePlaceholder('Sm 1', '#D6D0C7', '#6B6359')} alt="Small slide 1" className="ds-demo-slide-image" />
          </CarouselSlide>
          <CarouselSlide size="sm">
            <img src={makePlaceholder('Sm 2', '#C8C1B6', '#5A5248')} alt="Small slide 2" className="ds-demo-slide-image" />
          </CarouselSlide>
          <CarouselSlide size="sm">
            <img src={makePlaceholder('Sm 3', '#BEB7AC', '#4E473D')} alt="Small slide 3" className="ds-demo-slide-image" />
          </CarouselSlide>
        </Carousel>
      </div>
      <div>
        <Text size="sm" className="ds-demo-section-label">Large</Text>
        <Carousel label="Large slides example">
          <CarouselSlide size="lg">
            <img src={makePlaceholder('Lg 1', '#D6D0C7', '#6B6359')} alt="Large slide 1" className="ds-demo-slide-image" />
          </CarouselSlide>
          <CarouselSlide size="lg">
            <img src={makePlaceholder('Lg 2', '#C8C1B6', '#5A5248')} alt="Large slide 2" className="ds-demo-slide-image" />
          </CarouselSlide>
        </Carousel>
      </div>
    </div>
  );
}

export function CarouselWithControls() {
  return (
    <Carousel controls indicators label="Featured products">
      <CarouselSlide>
        <img src={makePlaceholder('Slide 1', '#D6D0C7', '#6B6359')} alt="Slide 1" className="ds-demo-slide-image" />
      </CarouselSlide>
      <CarouselSlide>
        <img src={makePlaceholder('Slide 2', '#C8C1B6', '#5A5248')} alt="Slide 2" className="ds-demo-slide-image" />
      </CarouselSlide>
      <CarouselSlide>
        <img src={makePlaceholder('Slide 3', '#BEB7AC', '#4E473D')} alt="Slide 3" className="ds-demo-slide-image" />
      </CarouselSlide>
      <CarouselSlide>
        <img src={makePlaceholder('Slide 4', '#B3AC9F', '#413A31')} alt="Slide 4" className="ds-demo-slide-image" />
      </CarouselSlide>
    </Carousel>
  );
}
