import { useState } from 'react';
import { StarRating } from '@ds/components';
import { Preview } from './Preview';

export function StarRatingDefault() {
  return (
    <Preview>
      <StarRating rating={4.5} reviewCount={128} />
    </Preview>
  );
}

export function StarRatingSizes() {
  return (
    <Preview>
      <StarRating rating={4} reviewCount={42} size="sm" />
      <StarRating rating={4} reviewCount={42} size="md" />
      <StarRating rating={4} reviewCount={42} size="lg" />
    </Preview>
  );
}

export function StarRatingValues() {
  return (
    <Preview>
      <StarRating rating={5} />
      <StarRating rating={4.5} />
      <StarRating rating={3} />
      <StarRating rating={1.5} />
      <StarRating rating={0} />
    </Preview>
  );
}

export function StarRatingWithLabel() {
  return (
    <Preview>
      <StarRating rating={4.5} reviewCount={128} label="Customer rating" />
    </Preview>
  );
}

function InteractiveStarRating() {
  const [rating, setRating] = useState(0);
  return <StarRating rating={rating} onRate={setRating} label="Your rating" />;
}

export function StarRatingInteractive() {
  return (
    <Preview>
      <InteractiveStarRating />
    </Preview>
  );
}

export function StarRatingWithCount() {
  return (
    <Preview>
      <StarRating rating={4.5} reviewCount={1} />
      <StarRating rating={4} reviewCount={128} />
      <StarRating rating={3.5} reviewCount={2403} />
    </Preview>
  );
}
