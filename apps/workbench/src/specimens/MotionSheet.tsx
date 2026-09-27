import { Heading } from '@ds/components';
import {
  DurationGallery,
  EasingGallery,
  FlipGallery,
  FlyToCartGallery,
  RevealGallery,
  ScrollRevealGallery,
} from './MotionDemo';
import './specimens.css';

/** Every motion token and pattern, playable. Scroll to the end for live scroll reveals. */
export function MotionSheet() {
  return (
    <div className="wb-sheet">
      <section className="wb-sheet__section">
        <Heading as="h2" size="xl">Easing</Heading>
        <EasingGallery />
      </section>
      <section className="wb-sheet__section">
        <Heading as="h2" size="xl">Duration</Heading>
        <DurationGallery />
      </section>
      <section className="wb-sheet__section">
        <Heading as="h2" size="xl">Reveal patterns</Heading>
        <RevealGallery />
      </section>
      <section className="wb-sheet__section">
        <Heading as="h2" size="xl">Filter and sort (FLIP)</Heading>
        <FlipGallery />
      </section>
      <section className="wb-sheet__section">
        <Heading as="h2" size="xl">Add to cart</Heading>
        <FlyToCartGallery />
      </section>
      <section className="wb-sheet__section">
        <Heading as="h2" size="xl">Scroll reveal, live</Heading>
        <ScrollRevealGallery />
      </section>
    </div>
  );
}
