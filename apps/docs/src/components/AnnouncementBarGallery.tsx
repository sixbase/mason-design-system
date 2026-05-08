import { useState } from 'react';
import { AnnouncementBar } from '@ds/components';
import { Preview } from './Preview';

export function AnnouncementBarDefault() {
  return (
    <Preview stack flush>
      <AnnouncementBar>Free shipping on orders over $50.</AnnouncementBar>
    </Preview>
  );
}

export function AnnouncementBarWithLink() {
  return (
    <Preview stack flush>
      <AnnouncementBar href="#">
        Summer sale — 20% off everything. Shop now.
      </AnnouncementBar>
    </Preview>
  );
}

export function AnnouncementBarDismissible() {
  const [visible, setVisible] = useState(true);

  return (
    <Preview stack flush>
      {visible ? (
        <AnnouncementBar dismissible onDismiss={() => setVisible(false)}>
          Free returns within 30 days of purchase.
        </AnnouncementBar>
      ) : (
        <button
          type="button"
          onClick={() => setVisible(true)}
          style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-3)' }}
        >
          Show announcement again
        </button>
      )}
    </Preview>
  );
}

export function AnnouncementBarDismissibleWithLink() {
  const [visible, setVisible] = useState(true);

  return (
    <Preview stack flush>
      {visible ? (
        <AnnouncementBar
          href="#"
          dismissible
          onDismiss={() => setVisible(false)}
        >
          New arrivals just dropped — explore the collection.
        </AnnouncementBar>
      ) : (
        <button
          type="button"
          onClick={() => setVisible(true)}
          style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-3)' }}
        >
          Show announcement again
        </button>
      )}
    </Preview>
  );
}
