import { Header, Text } from '@ds/components';
import { Preview } from './Preview';

const NAV_ITEMS = [
  { label: 'Shop', href: '#' },
  { label: 'Collections', href: '#' },
  { label: 'About', href: '#' },
];

export function HeaderDefault({ basePath = '' }: { basePath?: string }) {
  return (
    <Preview stack>
      <Header
        logoSrc={`${basePath}/mason-supply-co-logo.svg`}
        logoAlt="Mason Supply Co."
        navItems={NAV_ITEMS}
        cartHref="#"
        cartCount={3}
      />
    </Preview>
  );
}

export function HeaderMinimal({ basePath = '' }: { basePath?: string }) {
  return (
    <Preview stack>
      <Header
        logoSrc={`${basePath}/mason-supply-co-logo.svg`}
        logoAlt="Mason Supply Co."
        showThemeToggle={false}
      />
    </Preview>
  );
}

export function HeaderSticky({ basePath = '' }: { basePath?: string }) {
  return (
    <Preview stack flush>
      <div style={{ height: 'var(--size-content-sm)', overflowY: 'auto' }}>
        <Header
          logoSrc={`${basePath}/mason-supply-co-logo.svg`}
          logoAlt="Mason Supply Co."
          navItems={NAV_ITEMS}
          cartHref="#"
          cartCount={2}
          sticky
        />
        <div style={{ height: 'var(--size-content-xl)', padding: 'var(--spacing-6)' }}>
          <Text size="sm">
            Scroll this panel — the header stays pinned to the top with an
            elevation shadow.
          </Text>
        </div>
      </div>
    </Preview>
  );
}
