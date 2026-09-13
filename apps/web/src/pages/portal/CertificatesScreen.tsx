import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge, Button, Card, DataTable, Icon, ProgressMeter, SelectField, Switch, Tag, TextField,
} from '../../components';
import { PortalBody, PortalTopBar } from '../../layouts/PortalLayout';
import { useRequests } from '../../lib/queries/requests';
import { ApiError } from '../../lib/api';
import type { MedicalRequest, RequestStatus } from '../../lib/api';
import { formatDate, requestReference, statusLabel, statusTone, typeLabel } from '../../lib/format';
import { EmptyState, ErrorState, LoadingState } from './ui-states';
import { NewRequestModal } from './NewRequestModal';

/**
 * Migrated from ui_kits/portal/CertificatesScreen.jsx and connected to the API.
 *
 * The prototype's five hard-coded rows are replaced by GET /api/requests, which
 * the server scopes to the signed-in company. The filter panel, register table,
 * register-health meters and notification switches keep their original layout;
 * the filters now actually filter the real rows.
 */

const STATUS_OPTIONS: Array<{ value: RequestStatus; label: string }> = [
  'SUBMITTED', 'PENDING_PAYMENT', 'APPROVED', 'AT_LAB', 'RESULTS_RECEIVED', 'UNDER_REVIEW', 'COMPLETE', 'REJECTED',
].map((s) => ({ value: s as RequestStatus, label: statusLabel(s as RequestStatus) }));

export function CertificatesScreen() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = React.useState(true);
  const [digest, setDigest] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [site, setSite] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [creating, setCreating] = React.useState(false);

  const { data, isPending, isError, error, refetch } = useRequests();
  const requests = data?.requests ?? [];
  const summary = data?.summary;

  const sites = React.useMemo(
    () => [...new Set(requests.map((r) => r.employee.site).filter((s): s is string => Boolean(s)))].sort(),
    [requests],
  );

  const rows = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter((r) => {
      if (site && r.employee.site !== site) return false;
      if (status && r.status !== status) return false;
      if (!term) return true;
      return (
        r.employee.fullName.toLowerCase().includes(term) ||
        requestReference(r.id, r.createdAt).toLowerCase().includes(term) ||
        (r.employee.site ?? '').toLowerCase().includes(term)
      );
    });
  }, [requests, search, site, status]);

  const activeFilters = [
    site ? { key: 'site', label: site, clear: () => setSite('') } : null,
    status ? { key: 'status', label: statusLabel(status as RequestStatus), clear: () => setStatus('') } : null,
    search.trim() ? { key: 'search', label: `“${search.trim()}”`, clear: () => setSearch('') } : null,
  ].filter((f): f is { key: string; label: string; clear: () => void } => f !== null);

  const total = summary?.total ?? 0;
  const complete = summary?.byStatus.COMPLETE ?? 0;
  const inProgress = total - complete - (summary?.byStatus.REJECTED ?? 0);
  const rejected = summary?.byStatus.REJECTED ?? 0;

  return (
    <>
      <PortalTopBar
        title="Certificates"
        actions={
          <Button size="sm" variant="secondary" iconStart={<Icon name="download" size={15} />}>
            Export register
          </Button>
        }
      />
      <PortalBody>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)', alignItems: 'start', maxWidth: 1180 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card padding="var(--space-5)">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
                <TextField
                  label="Search"
                  placeholder="Certificate, worker ID or name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  iconStart={<Icon name="search" size={16} />}
                />
                <SelectField label="Site" placeholder="All sites" value={site} onChange={(e) => setSite(e.target.value)} options={sites} />
                <SelectField label="Status" placeholder="All statuses" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} />
              </div>
              {activeFilters.length > 0 && (
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>Active filters</span>
                  {activeFilters.map((f) => (
                    <Tag key={f.key} onRemove={f.clear}>{f.label}</Tag>
                  ))}
                </div>
              )}
            </Card>

            {isError ? (
              <ErrorState
                message={error instanceof ApiError ? error.message : 'The certificate register could not be loaded.'}
                onRetry={() => void refetch()}
              />
            ) : isPending ? (
              <LoadingState label="Loading the certificate register…" />
            ) : requests.length === 0 ? (
              <EmptyState
                title="No certificate requests yet"
                body="Once you submit an examination request for a worker it appears in this register, along with its status and the certificate reference."
                action={
                  <Button size="sm" onClick={() => setCreating(true)} iconStart={<Icon name="plus" size={15} />}>
                    New examination
                  </Button>
                }
              />
            ) : rows.length === 0 ? (
              <EmptyState
                title="No records match these filters"
                body="Clear or widen the filters above to see the rest of the register."
                action={
                  <Button size="sm" variant="secondary" onClick={() => { setSearch(''); setSite(''); setStatus(''); }}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <DataTable<MedicalRequest & Record<string, unknown>>
                  caption={`Certificate register — ${total} record${total === 1 ? '' : 's'}, ${rows.length} shown`}
                  onRowClick={(r) => navigate(`/portal/workers/${r.employeeId}`)}
                  columns={[
                    { key: 'ref', header: 'Reference', mono: true, width: '148px', render: (r) => requestReference(r.id, r.createdAt) },
                    { key: 'name', header: 'Worker', render: (r) => r.employee.fullName },
                    { key: 'site', header: 'Site', render: (r) => r.employee.site ?? '—' },
                    { key: 'type', header: 'Type', render: (r) => typeLabel(r.type) },
                    { key: 'createdAt', header: 'Submitted', align: 'end', numeric: true, render: (r) => formatDate(r.createdAt) },
                    { key: 'status', header: 'Status', render: (r) => <Badge tone={statusTone(r.status)} dot>{statusLabel(r.status)}</Badge> },
                  ]}
                  rows={rows as Array<MedicalRequest & Record<string, unknown>>}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card eyebrow="Register health" padding="var(--space-5)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <ProgressMeter label="Complete" valueLabel={`${complete} / ${total}`} value={complete} max={Math.max(total, 1)} tone="success" />
                <ProgressMeter label="In progress" valueLabel={`${inProgress} / ${total}`} value={inProgress} max={Math.max(total, 1)} tone="warning" />
                <ProgressMeter label="Rejected" valueLabel={`${rejected} / ${total}`} value={rejected} max={Math.max(total, 1)} tone="danger" />
              </div>
            </Card>
            <Card eyebrow="Notifications" padding="var(--space-5)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <Switch label="Expiry alerts" description="Email site supervisors 30 days before a certificate lapses" checked={alerts} onChange={setAlerts} />
                <Switch label="Weekly register digest" checked={digest} onChange={setDigest} />
              </div>
            </Card>
          </div>
        </div>
      </PortalBody>

      <NewRequestModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
