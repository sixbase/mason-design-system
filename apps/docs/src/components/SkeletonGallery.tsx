import { Skeleton } from '@ds/components';
import { Preview } from './Preview';

export function SkeletonDefault() {
  return (
    <Preview>
      <Skeleton variant="rectangular" width={300} height={120} />
    </Preview>
  );
}

export function SkeletonVariants() {
  return (
    <Preview>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)', maxWidth: '400px', width: '100%' }}>
        <div>
          <div style={{ marginBottom: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-foreground-muted)' }}>Rectangular</div>
          <Skeleton variant="rectangular" height={100} />
        </div>
        <div>
          <div style={{ marginBottom: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-foreground-muted)' }}>Circular</div>
          <Skeleton variant="circular" width={48} height={48} />
        </div>
        <div>
          <div style={{ marginBottom: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-foreground-muted)' }}>Text (single line)</div>
          <Skeleton variant="text" />
        </div>
        <div>
          <div style={{ marginBottom: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-foreground-muted)' }}>Text (3 lines)</div>
          <Skeleton variant="text" lines={3} />
        </div>
      </div>
    </Preview>
  );
}

export function SkeletonText() {
  return (
    <Preview>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <Skeleton variant="text" lines={4} />
      </div>
    </Preview>
  );
}

export function SkeletonProductCard() {
  return (
    <Preview>
      <div style={{ width: '280px', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        <Skeleton variant="rectangular" height={280} />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </Preview>
  );
}

export function SkeletonAvatarWithText() {
  return (
    <Preview>
      <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center', maxWidth: '300px', width: '100%' }}>
        <Skeleton variant="circular" width={40} height={40} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="text" width="80%" />
        </div>
      </div>
    </Preview>
  );
}

export function SkeletonProductGrid() {
  return (
    <Preview>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-6)', width: '100%' }}>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <Skeleton variant="rectangular" height={200} />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="60%" />
          </div>
        ))}
      </div>
    </Preview>
  );
}

export function SkeletonStatic() {
  return (
    <Preview>
      <Skeleton variant="rectangular" width={300} height={100} animate={false} />
    </Preview>
  );
}
