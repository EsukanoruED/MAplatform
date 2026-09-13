import type { ReactNode } from 'react';
import { Alert, Button, Card, Icon } from '../../components';

/**
 * Shared loading / empty / error states for the data-backed portal screens.
 * These are new in Phase 1 — the prototype rendered hard-coded arrays, so it had
 * no in-flight, no-data or failed-fetch state to show.
 */

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <Card tone="sunken" padding="var(--space-10)" style={{ alignItems: 'center' }}>
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--text-muted)' }}
      >
        <Icon name="loader" size={22} />
        <span style={{ font: 'var(--type-body-sm)' }}>{label}</span>
      </div>
    </Card>
  );
}

export function EmptyState({
  title, body, action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Card tone="sunken" padding="var(--space-10)" style={{ alignItems: 'flex-start' }}>
      <span style={{ color: 'var(--text-muted)' }}><Icon name="file-badge" size={24} /></span>
      <h2 style={{ font: 'var(--type-heading-4)', marginTop: 'var(--space-2)' }}>{title}</h2>
      <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)', maxWidth: '52ch' }}>{body}</p>
      {action && <div style={{ marginTop: 'var(--space-4)' }}>{action}</div>}
    </Card>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Alert
      tone="danger"
      title="Could not load this data"
      icon={<Icon name="triangle-alert" size={18} />}
      actions={onRetry ? <Button size="sm" variant="secondary" onClick={onRetry}>Try again</Button> : undefined}
    >
      {message}
    </Alert>
  );
}

/** Placeholder for the portal sections the prototype left intentionally blank. */
export function NotBuiltState({ title }: { title: string }) {
  return (
    <Card tone="sunken" padding="var(--space-12)" style={{ maxWidth: 560, alignItems: 'flex-start' }}>
      <span style={{ color: 'var(--text-muted)' }}><Icon name="construction" size={26} /></span>
      <h2 style={{ font: 'var(--type-heading-4)', marginTop: 'var(--space-3)' }}>{title}</h2>
      <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
        Left intentionally blank — no source design was supplied for this view. Build it against the
        real product screens rather than inventing one here.
      </p>
    </Card>
  );
}
