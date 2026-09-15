import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Card, DataTable, Icon, SelectField, StatTile, Tag } from '../../components';
import { PortalBody, PortalTopBar } from '../../layouts/PortalLayout';
import { useAdminDashboard, useAdminRequests } from '../../lib/queries/workflow';
import { ApiError } from '../../lib/api';
import type { AdminRequestRow, RequestStatus, RequestType } from '../../lib/api';
import { formatDate, requestReference, statusLabel, statusTone, typeLabel } from '../../lib/format';
import { EmptyState, ErrorState, LoadingState } from './../portal/ui-states';

/**
 * The Medical Alliance staff queue — every company's requests in one place.
 *
 * This is the one list in the product that is deliberately NOT tenant-scoped,
 * which is why it sits behind the separate AdminUser identity and the admin
 * guard. The company column exists precisely because these rows span tenants.
 */
const STATUS_OPTIONS: Array<{ value: RequestStatus; label: string }> = (
  [
    'SUBMITTED',
    'PENDING_PAYMENT',
    'APPROVED',
    'AT_LAB',
    'RESULTS_RECEIVED',
    'UNDER_REVIEW',
    'COMPLETE',
    'REJECTED',
  ] as RequestStatus[]
).map((s) => ({ value: s, label: statusLabel(s) }));

export function AdminRequestsScreen() {
  const navigate = useNavigate();
  const [status, setStatus] = React.useState('');
  const [type, setType] = React.useState('');

  const filters = {
    ...(status ? { status: status as RequestStatus } : {}),
    ...(type ? { type: type as RequestType } : {}),
  };

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useAdminRequests(filters);
  const { data: dashboard } = useAdminDashboard();

  const rows = (data?.requests ?? []) as Array<AdminRequestRow & Record<string, unknown>>;
  const hasFilters = Boolean(status || type);
  const summary = dashboard?.summary;

  return (
    <>
      <PortalTopBar title="Request queue" crumbs={['Medical Alliance', 'Operations']} />
      <PortalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 1180 }}>
          <section
            aria-label="Platform summary"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}
          >
            <StatTile
              label="Awaiting review"
              value={summary?.awaitingReview ?? '—'}
              tone="brand"
              icon={<Icon name="clipboard-check" size={18} />}
            />
            <StatTile
              label="Total requests"
              value={summary?.requests.total ?? '—'}
              icon={<Icon name="file-badge" size={18} />}
            />
            <StatTile label="Companies" value={summary?.companies ?? '—'} icon={<Icon name="building-2" size={18} />} />
            <StatTile tone="ink" label="Active laboratories" value={summary?.activeLabs ?? '—'} />
          </section>

          <Card padding="var(--space-5)">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
              <SelectField
                label="Status"
                placeholder="All statuses"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={STATUS_OPTIONS}
              />
              <SelectField
                label="Type"
                placeholder="All types"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { value: 'FITNESS_CERTIFICATE', label: 'Fitness certificate' },
                  { value: 'CHECKUP', label: 'Checkup' },
                ]}
              />
            </div>
            {hasFilters && (
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>Active filters</span>
                {status && <Tag onRemove={() => setStatus('')}>{statusLabel(status as RequestStatus)}</Tag>}
                {type && <Tag onRemove={() => setType('')}>{typeLabel(type as RequestType)}</Tag>}
              </div>
            )}
          </Card>

          {isError ? (
            <ErrorState
              message={error instanceof ApiError ? error.message : 'The queue could not be loaded.'}
              onRetry={() => void refetch()}
            />
          ) : isPending ? (
            <LoadingState label="Loading the queue…" />
          ) : rows.length === 0 ? (
            <EmptyState
              title={hasFilters ? 'No requests match these filters' : 'The queue is empty'}
              body={
                hasFilters
                  ? 'Clear or widen the filters above to see the rest of the queue.'
                  : 'Requests submitted by companies appear here for review.'
              }
            />
          ) : (
            <div style={{ overflowX: 'auto', opacity: isPlaceholderData ? 0.6 : 1 }}>
              <DataTable<AdminRequestRow & Record<string, unknown>>
                caption={`Cross-company queue — ${rows.length} record${rows.length === 1 ? '' : 's'}`}
                onRowClick={(r) => navigate(`/admin/requests/${r.id}`)}
                columns={[
                  {
                    key: 'ref',
                    header: 'Reference',
                    mono: true,
                    width: '150px',
                    render: (r) => requestReference(r.id, r.createdAt),
                  },
                  { key: 'company', header: 'Company', render: (r) => r.company.legalName },
                  { key: 'worker', header: 'Worker', render: (r) => r.employee.fullName },
                  { key: 'type', header: 'Type', render: (r) => typeLabel(r.type) },
                  { key: 'lab', header: 'Laboratory', render: (r) => r.assignedLab?.name ?? '—' },
                  {
                    key: 'createdAt',
                    header: 'Submitted',
                    align: 'end',
                    numeric: true,
                    render: (r) => formatDate(r.createdAt),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (r) => (
                      <Badge tone={statusTone(r.status)} dot>
                        {statusLabel(r.status)}
                      </Badge>
                    ),
                  },
                ]}
                rows={rows}
              />
            </div>
          )}
        </div>
      </PortalBody>
    </>
  );
}
