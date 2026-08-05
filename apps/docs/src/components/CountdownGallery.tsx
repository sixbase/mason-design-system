import { useState } from 'react';
import { Countdown, Text } from '@ds/components';
import { Preview } from './Preview';

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

export function CountdownDefault() {
  return (
    <Preview>
      <Countdown target={new Date(Date.now() + 2 * DAY + 3 * HOUR + 24 * MINUTE)} />
    </Preview>
  );
}

export function CountdownSizes() {
  return (
    <Preview stack>
      <Countdown target={new Date(Date.now() + 2 * DAY + 3 * HOUR + 24 * MINUTE)} size="md" />
      <Countdown target={new Date(Date.now() + 2 * DAY + 3 * HOUR + 24 * MINUTE)} size="sm" />
    </Preview>
  );
}

export function CountdownCustomLabels() {
  return (
    <Preview>
      <Countdown
        target={new Date(Date.now() + 6 * HOUR + 12 * MINUTE)}
        labels={{ days: 'd', hours: 'h', minutes: 'm', seconds: 's' }}
      />
    </Preview>
  );
}

export function CountdownHideZeroUnits() {
  return (
    <Preview stack>
      <Countdown target={new Date(Date.now() + 45 * MINUTE)} hideZeroUnits />
      <Countdown target={new Date(Date.now() + 3 * HOUR)} hideZeroUnits />
    </Preview>
  );
}

export function CountdownCompletion() {
  const [completed, setCompleted] = useState(false);
  // Fixed per-mount target so re-renders don't move the goalpost.
  const [target] = useState(() => new Date(Date.now() + 15_000));

  return (
    <Preview stack>
      <Countdown target={target} hideZeroUnits onComplete={() => setCompleted(true)} />
      <Text size="sm" muted>
        {completed ? 'onComplete fired — sale ended.' : 'Ends in a few seconds…'}
      </Text>
    </Preview>
  );
}
