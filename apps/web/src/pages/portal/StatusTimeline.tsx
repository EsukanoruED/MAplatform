import { Badge, Icon } from '../../components';
import type { RequestStatusEvent } from '../../lib/api';
import { actorLabel, formatDate, statusLabel, statusTone } from '../../lib/format';

/**
 * The request's status history.
 *
 * Rendered entirely from the persisted RequestStatusEvent rows the API returns —
 * there is no hard-coded or client-derived step list here. A request that has
 * moved twice shows two entries; the shape of the pipeline is not assumed.
 */
export function StatusTimeline({ events }: { events: RequestStatusEvent[] }) {
  if (events.length === 0) {
    return (
      <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
        No status changes recorded yet.
      </p>
    );
  }

  // Newest first: the current state is what a reader is looking for.
  const ordered = [...events].reverse();

  return (
    <ol
      aria-label="Status history"
      style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}
    >
      {ordered.map((event, index) => {
        const isCurrent = index === 0;
        return (
          <li
            key={event.id}
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: 'var(--space-3)',
              paddingBottom: index === ordered.length - 1 ? 0 : 'var(--space-4)',
            }}
          >
            {/* Marker column, with the connecting rule drawn between entries. */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span
                aria-hidden="true"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  marginTop: 5,
                  background: isCurrent ? 'var(--surface-brand)' : 'var(--ma-neutral-300)',
                  flex: '0 0 auto',
                }}
              />
              {index !== ordered.length - 1 && (
                <span
                  aria-hidden="true"
                  style={{ width: 1, flex: 1, background: 'var(--border-default)', marginTop: 4 }}
                />
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <Badge tone={statusTone(event.toStatus)} dot>
                  {statusLabel(event.toStatus)}
                </Badge>
                {event.fromStatus && (
                  <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                    from {statusLabel(event.fromStatus)}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', font: 'var(--type-caption)', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="clock" size={13} />
                  {formatDate(event.changedAt)}
                </span>
                <span>·</span>
                <span>{actorLabel(event.changedByType)}</span>
              </div>
              {event.note && (
                <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {event.note}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
