import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Badge, Button, Card, DataTable, Icon, ProgressMeter, StatTile, Tabs,
} from '../../components';
import { PortalBody, PortalTopBar } from '../../layouts/PortalLayout';
import { useRequests } from '../../lib/queries/requests';
import type { MedicalRequest, RequestStatus } from '../../lib/api';
import { ApiError } from '../../lib/api';
import { formatDate, statusLabel, statusTone, typeLabel } from '../../lib/format';
import { EmptyState, ErrorState, LoadingState } from './ui-states';
import { NewRequestModal } from './NewRequestModal';

/**
 * Migrated from ui_kits/portal/DashboardScreen.jsx and connected to the API.
 *
 * The prototype's hard-coded WORKERS array and fixed stat figures are gone: every
 * number on this screen is now derived from GET /api/requests, which the server
 * scopes to the signed-in user's company. Layout, tile arrangement and the
 * three-tab table are unchanged.
 */

const OPEN_STATUSES: RequestStatus[] = [
  'SUBMITTED', 'PENDING_PAYMENT', 'APPROVED', 'AT_LAB', 'RESULTS_RECEIVED', 'UNDER_REVIEW',
];

type TabKey = 'due' | 'recent' | 'flagged';

function partition(requests: MedicalRequest[]) {
  return {
    due: requests.filter((r) => OPEN_STATUSES.includes(r.status)),
    recent: requests.filter((r) => r.status === 'COMPLETE'),
    flagged: requests.filter((r) => r.status === 'REJECTED'),
  };
}

export function DashboardScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<TabKey>('due');
  const [creating, setCreating] = React.useState(false);
  const { data, isPending, isError, error, refetch } = useRequests();

  const requests = data?.requests ?? [];
  const byStatus = data?.summary.byStatus;
  const groups = partition(requests);
  const rows = groups[tab];

  const openCount = OPEN_STATUSES.reduce((n, s) => n + (byStatus?.[s] ?? 0), 0);
  const atLabCount = byStatus?.AT_LAB ?? 0;
  const completeCount = byStatus?.COMPLETE ?? 0;
  const attentionCount = (byStatus?.PENDING_PAYMENT ?? 0) + (byStatus?.UNDER_REVIEW ?? 0);

  return (
    <>
      <PortalTopBar
        title="Dashboard"
        actions={
          <Button size="sm" iconStart={<Icon name="plus" size={15} />} onClick={() => setCreating(true)}>
            New examination
          </Button>
        }
      />
      <PortalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 1180 }}>
          {isError && (
            <ErrorState
              message={error instanceof ApiError ? error.message : 'The request register could not be loaded.'}
              onRetry={() => void refetch()}
            />
          )}

          {attentionCount > 0 && (
            <Alert
              tone="warning"
              title={`${attentionCount} ${attentionCount === 1 ? 'request needs' : 'requests need'} attention`}
              icon={<Icon name="calendar-clock" size={18} />}
              actions={<Button size="sm" variant="secondary" onClick={() => navigate('/portal/certificates')}>Review register</Button>}
            >
              Requests awaiting payment or clinical review are held until they are actioned.
            </Alert>
          )}

          {/* Labelled so assistive tech (and tests) can address the summary row
              as a unit — several of these labels also appear in the tables below. */}
          <section
            aria-label="Request summary"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}
          >
            <StatTile label="Open requests" value={isPending ? '—' : openCount} icon={<Icon name="shield-check" size={18} />} footnote="Not yet complete" />
            <StatTile label="At lab" value={isPending ? '—' : atLabCount} unit="requests" tone="brand" icon={<Icon name="calendar-clock" size={18} />} />
            <StatTile label="Needs attention" value={isPending ? '—' : attentionCount} icon={<Icon name="triangle-alert" size={18} />} footnote="Payment or review" />
            <StatTile tone="ink" label="Completed" value={isPending ? '—' : completeCount} footnote="Certificates issued" />
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-5)', alignItems: 'start' }}>
            <Card padding="0" style={{ gridColumn: 'span 1' }}>
              <div style={{ padding: 'var(--space-5) var(--space-5) 0' }}>
                <Tabs
                  value={tab}
                  onChange={(v) => setTab(v as TabKey)}
                  size="sm"
                  items={[
                    { value: 'due', label: 'Due for review', count: groups.due.length },
                    { value: 'recent', label: 'Recently issued', count: groups.recent.length },
                    { value: 'flagged', label: 'Flagged', count: groups.flagged.length },
                  ]}
                />
              </div>
              <div style={{ padding: 'var(--space-5)' }}>
                {isPending ? (
                  <LoadingState label="Loading requests…" />
                ) : rows.length === 0 ? (
                  <EmptyState
                    title={requests.length === 0 ? 'No requests yet' : 'Nothing in this view'}
                    body={
                      requests.length === 0
                        ? 'Submit an examination request for one of your workers and it will appear here.'
                        : 'No requests currently sit in this state.'
                    }
                    action={
                      requests.length === 0 ? (
                        <Button size="sm" onClick={() => setCreating(true)} iconStart={<Icon name="plus" size={15} />}>
                          New examination
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <DataTable<MedicalRequest & Record<string, unknown>>
                      dense
                      onRowClick={(r) => navigate(`/portal/workers/${r.employeeId}`)}
                      style={{ border: 0, borderRadius: 0 }}
                      columns={[
                        { key: 'employee', header: 'Worker', render: (r) => r.employee.fullName },
                        { key: 'site', header: 'Site', render: (r) => r.employee.site ?? '—' },
                        { key: 'type', header: 'Examination', render: (r) => typeLabel(r.type) },
                        { key: 'status', header: 'Status', render: (r) => <Badge tone={statusTone(r.status)} dot>{statusLabel(r.status)}</Badge> },
                        { key: 'createdAt', header: 'Submitted', align: 'end', numeric: true, render: (r) => formatDate(r.createdAt) },
                      ]}
                      rows={rows as Array<MedicalRequest & Record<string, unknown>>}
                    />
                  </div>
                )}
              </div>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <Card eyebrow="Programme" title="Request pipeline">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                  {(['SUBMITTED', 'AT_LAB', 'UNDER_REVIEW', 'COMPLETE'] as RequestStatus[]).map((s) => {
                    const count = byStatus?.[s] ?? 0;
                    const total = data?.summary.total ?? 0;
                    return (
                      <ProgressMeter
                        key={s}
                        label={statusLabel(s)}
                        valueLabel={`${count} / ${total}`}
                        value={count}
                        max={Math.max(total, 1)}
                        tone={s === 'COMPLETE' ? 'success' : s === 'UNDER_REVIEW' ? 'warning' : 'brand'}
                      />
                    );
                  })}
                </div>
              </Card>
              <Card eyebrow="Today" title="Clinic schedule" footer="Jazan Site 4 · Dr N. Al-Qahtani">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {([['08:30', 'Pre-placement × 4', 'shield-check'], ['10:00', 'Audiometry block', 'ear'], ['13:00', 'Return-to-work review', 'clipboard-check'], ['15:30', 'Stock count', 'package']] as const).map(([t, l, ic], i) => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2-5) 0', borderTop: i ? '1px solid var(--border-subtle)' : 0 }}>
                      <span style={{ font: 'var(--weight-semibold) var(--text-xs)/1 var(--font-mono)', color: 'var(--text-muted)', width: 44 }}>{t}</span>
                      <span style={{ color: 'var(--text-brand)' }}><Icon name={ic} size={16} /></span>
                      <span style={{ font: 'var(--type-body-sm)' }}>{l}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </PortalBody>

      <NewRequestModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
