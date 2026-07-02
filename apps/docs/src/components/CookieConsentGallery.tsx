import { useState } from 'react';
import { CookieConsent, Button, Text } from '@ds/components';
import type { CookieCategory } from '@ds/components';
import { Preview } from './Preview';

const categories: CookieCategory[] = [
  {
    id: 'essential',
    label: 'Strictly Necessary Cookies',
    description: 'These cookies are essential for the website to function and cannot be switched off in our systems.',
    required: true,
  },
  {
    id: 'functional',
    label: 'Functional Cookies',
    description: 'These cookies enable enhanced functionality and personalization.',
  },
  {
    id: 'performance',
    label: 'Performance Cookies',
    description: 'These cookies help us understand how visitors interact with the website.',
  },
  {
    id: 'targeting',
    label: 'Targeting Cookies',
    description: 'These cookies are used to deliver personalized advertisements.',
  },
];

/** Wrapper that contains fixed-position banner within the preview */
function BannerContainer({ children, tall }: { children: React.ReactNode; tall?: boolean }) {
  return (
    <div
      style={{
        transform: 'translateZ(0)',
        position: 'relative',
        minHeight: tall ? 680 : 280,
        overflow: 'hidden',
        background: 'var(--color-background)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div style={{ padding: 'var(--spacing-4)', color: 'var(--color-foreground-muted)', fontFamily: 'var(--font-family-body)', fontSize: 'var(--font-size-sm)' }}>
        Page content appears behind the banner.
      </div>
      {children}
    </div>
  );
}

export function CookieConsentDefault() {
  return (
    <Preview stack>
      <BannerContainer>
        <CookieConsent
          onAccept={(ids) => console.log('Accepted:', ids)}
          onReject={() => console.log('Rejected')}
        />
      </BannerContainer>
    </Preview>
  );
}

export function CookieConsentWithCategories() {
  return (
    <Preview stack>
      <BannerContainer tall>
        <CookieConsent
          categories={categories}
          onAccept={(ids) => console.log('Accepted:', ids)}
          onReject={() => console.log('Rejected')}
        />
      </BannerContainer>
    </Preview>
  );
}

export function CookieConsentControlled() {
  const [open, setOpen] = useState(false);

  return (
    <Preview stack>
      <div className="ds-gallery-stack">
        <Button size="sm" onClick={() => setOpen(true)}>Show Cookie Banner</Button>
        <Text size="sm" className="ds-gallery-label">
          Banner is {open ? 'visible' : 'hidden'}
        </Text>
      </div>
      <BannerContainer tall>
        <CookieConsent
          open={open}
          onOpenChange={setOpen}
          categories={categories}
          onAccept={(ids) => {
            console.log('Accepted:', ids);
            setOpen(false);
          }}
          onReject={() => {
            console.log('Rejected');
            setOpen(false);
          }}
        />
      </BannerContainer>
    </Preview>
  );
}
