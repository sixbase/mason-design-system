import { Avatar } from '@ds/components';
import { Preview } from './Preview';

const SAMPLE_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 55 55"%3E%3Crect width="55" height="55" fill="%23847D73"/%3E%3Ccircle cx="27.5" cy="21" r="9" fill="%23FAF9F7"/%3E%3Cellipse cx="27.5" cy="46" rx="16" ry="13" fill="%23FAF9F7"/%3E%3C/svg%3E';

export function AvatarSizes() {
  return (
    <Preview>
      <Avatar name="Ada Lovelace" size="sm" />
      <Avatar name="Ada Lovelace" size="md" />
      <Avatar name="Ada Lovelace" size="lg" />
    </Preview>
  );
}

export function AvatarImage() {
  return (
    <Preview>
      <Avatar name="Ada Lovelace" src={SAMPLE_IMAGE} />
      <Avatar name="Grace Hopper" src="/does-not-exist.jpg" />
    </Preview>
  );
}

export function AvatarFallbackTones() {
  return (
    <Preview>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Alan Turing" />
      <Avatar name="Katherine Johnson" />
      <Avatar name="Edsger Dijkstra" />
      <Avatar name="Barbara Liskov" />
    </Preview>
  );
}

export function AvatarShapes() {
  return (
    <Preview>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Mason Supply" shape="square" />
    </Preview>
  );
}
