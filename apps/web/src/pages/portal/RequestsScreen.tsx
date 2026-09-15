import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, DataTable, Icon, SelectField, Tag, TextField } from '../../components';
import { PortalBody, PortalTopBar } from '../../layouts/PortalLayout';
import { useRequests } from '../../lib/queries/requests';
import { ApiError } from '../../lib/api';
import type { MedicalRequest, RequestStatus, RequestType } from '../../lib/api';
import { formatDate, requestReference, statusLabel, statusTone, typeLabel } from '../../lib/format';
import { EmptyState, ErrorState, LoadingState } from './ui-states';
import { NewRequestModal } from './NewRequestModal';

/**
 * The company's request queue.
 *
 * Filtering happens server-side (GET /api/requests accepts status, type and a
 * name search), so the list a company sees is built by a tenant-scoped query
 * rather than by filtering a wider result set in the browser.
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

export function RequestsScreen() {
  const navigate = useNavigate();
  const [status, setStatus] = React.useState('');
  const [type, setType] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [creating, setCreating] = React.useState(false);

  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const filters = {
    ...(status ? { status: status as RequestStatus } : {}),
    ...(type ? { type: type as RequestType } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useRequests(filters);
  const rows = (data?.requests ?? []) as Array<MedicalRequest & Record<string, unknown>>;
  const hasFilters = Boolean(status || type || debouncedSearch);

  const clearFilters = () => {
    setStatus('');
    setType('');
    setSearch('');
  };

  return (
    <>
      <PortalTopBar
        title="Requests"
        actions={
          <Button size="sm" iconStart={<Icon name="plus" size={15} />} onClick={() => setCreating(true)}>
            New request
          </Button>
        }
      />
      <PortalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 1180 }}>
          <Card padding="var(--space-5)">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
              <TextField
                label="Search"
                placeholder="Worker name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                iconStart={<Icon name="search" size={16} />}
              />
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
                {debouncedSearch && <Tag onRemove={() => setSearch('')}>{`“${debouncedSearch}”`}</Tag>}
                {status && <Tag onRemove={() => setStatus('')}>{statusLabel(status as RequestStatus)}</Tag>}
                {type && <Tag onRemove={() => setType('')}>{typeLabel(type as RequestType)}</Tag>}
              </div>
            )}
          </Card>

          {isError ? (
            <ErrorState
              message={error instanceof ApiError ? error.message : 'The request queue could not be loaded.'}
              onRetry={() => void refetch()}
            />
          ) : isPending ? (
            <LoadingState label="Loading requests…" />
          ) : rows.length === 0 && !hasFilters ? (
            <EmptyState
              title="No requests yet"
              body="File an examination request for one of your workers and it will appear here with its status and history."
              action={
                <Button size="sm" onClick={() => setCreating(true)} iconStart={<Icon name="plus" size={15} />}>
                  New request
                </Button>
              }
            />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No requests match these filters"
              body="Clear or widen the filters above to see the rest of the queue."
              action={
                <Button size="sm" variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div style={{ overflowX: 'auto', opacity: isPlaceholderData ? 0.6 : 1 }}>
              <DataTable<MedicalRequest & Record<string, unknown>>
                caption={`Request queue — ${rows.length} record${rows.length === 1 ? '' : 's'}`}
                onRowClick={(r) => navigate(`/portal/requests/${r.id}`)}
                columns={[
                  {
                    key: 'ref',
                    header: 'Reference',
                    mono: true,
                    width: '150px',
                    render: (r) => requestReference(r.id, r.createdAt),
                  },
                  { key: 'worker', header: 'Worker', render: (r) => r.employee.fullName },
                  { key: 'site', header: 'Site', render: (r) => r.employee.site ?? '—' },
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

      <NewRequestModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(request) => navigate(`/portal/requests/${request.id}`)}
      />
    </>
  );
}
