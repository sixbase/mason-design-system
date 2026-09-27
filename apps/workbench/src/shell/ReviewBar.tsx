import { forwardRef } from 'react';
import { Button, ChevronLeft, ChevronRight, Input, SegmentedControl, SegmentedControlItem } from '@ds/components';
import { setReview, useReviews } from '../lib/review';
import type { ReviewStatus } from '../lib/review';

/** Bottom bar: record a verdict and a note, then move on. */
export const ReviewBar = forwardRef<HTMLInputElement, { reviewKey: string; label: string; onPrev: () => void; onNext: () => void }>(
  function ReviewBar({ reviewKey, label, onPrev, onNext }, noteRef) {
    const review = useReviews()[reviewKey] ?? {};
    return (
      <footer className="wb-review" aria-label={`Review ${label}`}>
        <Button size="sm" variant="ghost" iconOnly aria-label="Previous (K)" onClick={onPrev}>
          <ChevronLeft size="sm" />
        </Button>

        <SegmentedControl
          className="wb-review__verdict"
          size="sm"
          aria-label="Verdict"
          value={review.status ?? 'none'}
          onValueChange={(v) => setReview(reviewKey, { status: v === 'none' ? undefined : (v as ReviewStatus) })}
        >
          <SegmentedControlItem value="none">Not reviewed</SegmentedControlItem>
          <SegmentedControlItem value="good">Looks good</SegmentedControlItem>
          <SegmentedControlItem value="issue">Needs work</SegmentedControlItem>
        </SegmentedControl>

        <div className="wb-review__note">
          <Input
            ref={noteRef}
            size="sm"
            placeholder={review.status === 'issue' ? 'What looks wrong? (width, theme, state…)' : 'Notes'}
            aria-label={`Notes for ${label}`}
            value={review.note ?? ''}
            onChange={(e) => setReview(reviewKey, { note: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') (e.target as HTMLInputElement).blur();
            }}
          />
        </div>

        <span className="wb-review__keys" aria-hidden="true">
          <kbd>G</kbd> good + next · <kbd>N</kbd> needs work · <kbd>J</kbd>/<kbd>K</kbd> next/prev · <kbd>T</kbd> theme · <kbd>W</kbd> width
        </span>

        <Button size="sm" variant="ghost" iconOnly aria-label="Next (J)" onClick={onNext}>
          <ChevronRight size="sm" />
        </Button>
      </footer>
    );
  },
);
ReviewBar.displayName = 'ReviewBar';
