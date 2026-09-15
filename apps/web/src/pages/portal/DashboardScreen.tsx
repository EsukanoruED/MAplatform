import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, DataTable, Icon, ProgressMeter, StatTile } from '../../components';
import { PortalBody, PortalTopBar } from '../../layouts/PortalLayout';
import { useCompanyDashboard } from '../../lib/queries/workflow';
import { ApiError } from '../../lib/api';
import type { CompanyDashboardSummary, RequestStatus } from '../../lib/api';
import {
  formatDate,
  formatMoney,
  relativeDays,
  statusLabel,
  statusTone,
  typeLabel,
} from '../../lib/format';
import { EmptyState, ErrorState, LoadingState } from './ui-states';
import { NewRequestModal } from './NewRequestModal';

/**
 * The company dashboard.
 *
 * Every figure comes from GET /api/dashboard/company/summary, which aggregates
 * the tenant's own rows in the database. Nothing on this screen is hard-coded,
 * and nothing is recomputed in the browser from a partial list — so a tile can
 * never disagree with the records behind it.
 *
 * The layout is the prototype's: an alert band, a four-tile stat row, then a
 * two-column body. Only the data source changed.
 */
type RecentRequest = CompanyDashboardSummary['recentRequests'][number];

/** The pipeline stages worth charting, in workflow order. */
const PIPELINE: RequestStatus[] = ['SUBMITTED', 'APPROVED', 'AT_LAB', 'UNDER_REVIEW', 'COMPLETE'];

export function DashboardScreen() {
  const navigate = useNavigate();
  const [creating, setCreating] = React.useState(false);
  const { data, isPending, isError, error, refetch } = useCompanyDashboard();

  const summary = data?.summary;
  const recent = (data?.recentRequests ?? []) as Array<RecentRequest & Record<string, unknown>>;
  const expiring = data?.expiringCertificates ?? [];

  const pendingAction = summary?.requests.pendingAction ?? 0;
  const expiringSoon = summary?.certificates.expiringSoon ?? 0;
  const requestTotal = summary?.requests.total ?? 0;

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
              message={error instanceof ApiError ? error.message : 'The dashboard could not be loaded.'}
              onRetry={() => void refetch()}
            />
          )}

          {expiringSoon > 0 && (
            <Alert
              tone="warning"
              title={`${expiringSoon} certificate${expiringSoon === 1 ? '' : 's'} expire${expiringSoon === 1 ? 's' : ''} in the next ${summary?.certificates.expiringWithinDays ?? 30} days`}
              icon={<Icon name="calendar-clock" size={18} />}
              actions={
                <Button size="sm" variant="secondary" onClick={() => navigate('/portal/certificates')}>
                  Review register
                </Button>
              }
            >
              Schedule the periodic examinations before the current certificates lapse.
            </Alert>
          )}

          {pendingAction > 0 && (
            <Alert
              tone="warning"
              title={`${pendingAction} ${pendingAction === 1 ? 'request needs' : 'requests need'} your attention`}
              icon={<Icon name="triangle-alert" size={18} />}
              actions={
                <Button size="sm" variant="secondary" onClick={() => navigate('/portal/requests?status=PENDING_PAYMENT')}>
                  View requests
                </Button>
              }
            >
              Requests awaiting payment are held until the charge is settled.
            </Alert>
          )}

          {/* Labelled so assistive tech (and tests) can address the summary row
              as a unit — several of these labels also appear in the tables below. */}
          <section
            aria-label="Request summary"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}
          >
            {/* Keyed off the presence of data, not `isPending`: a query that has
                FAILED is also no longer pending, so dereferencing the summary on
                that flag would crash the screen instead of showing the error. */}
            <StatTile
              label="Registered workers"
              value={summary ? summary.employees.active : '—'}
              icon={<Icon name="users" size={18} />}
              footnote={summary ? `${summary.employees.total} total on file` : undefined}
            />
            <StatTile
              label="Open requests"
              value={summary ? summary.requests.open : '—'}
              unit="in progress"
              tone="brand"
              icon={<Icon name="shield-check" size={18} />}
            />
            <StatTile
              label="Needs attention"
              value={summary ? pendingAction : '—'}
              icon={<Icon name="triangle-alert" size={18} />}
              footnote="Awaiting payment"
            />
            <StatTile
              tone="ink"
              label="Certificates"
              value={summary ? summary.certificates.total : '—'}
              footnote={summary ? `${expiringSoon} expiring soon` : undefined}
            />
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-5)', alignItems: 'start' }}>
            <Card padding="0">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-5)', borderBottom: '1px solid var(--border-subtle)' }}>
                <h2 style={{ font: 'var(--type-heading-4)' }}>Recent requests</h2>
                <Button size="sm" variant="ghost" onClick={() => navigate('/portal/requests')}>
                  View all
                </Button>
              </div>
              <div style={{ padding: 'var(--space-5)' }}>
                {isPending ? (
                  <LoadingState label="Loading requests…" />
                ) : isError ? (
                  // Don't claim "no requests yet" when the load simply failed.
                  <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
                    Recent requests could not be loaded.
                  </p>
                ) : recent.length === 0 ? (
                  <EmptyState
                    title="No requests yet"
                    body="Submit an examination request for one of your workers and it will appear here."
                    action={
                      <Button size="sm" onClick={() => setCreating(true)} iconStart={<Icon name="plus" size={15} />}>
                        New examination
                      </Button>
                    }
                  />
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <DataTable<RecentRequest & Record<string, unknown>>
                      dense
                      style={{ border: 0, borderRadius: 0 }}
                      onRowClick={(r) => navigate(`/portal/requests/${r.id}`)}
                      columns={[
                        { key: 'worker', header: 'Worker', render: (r) => r.employee.fullName },
                        { key: 'site', header: 'Site', render: (r) => r.employee.site ?? '—' },
                        { key: 'type', header: 'Examination', render: (r) => typeLabel(r.type) },
                        {
                          key: 'status',
                          header: 'Status',
                          render: (r) => (
                            <Badge tone={statusTone(r.status)} dot>
                              {statusLabel(r.status)}
                            </Badge>
                          ),
                        },
                        {
                          key: 'createdAt',
                          header: 'Submitted',
                          align: 'end',
                          numeric: true,
                          render: (r) => formatDate(r.createdAt),
                        },
                      ]}
                      rows={recent}
                    />
                  </div>
                )}
              </div>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <Card eyebrow="Programme" title="Request pipeline">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                  {PIPELINE.map((status) => {
                    const count = summary?.requests.byStatus[status] ?? 0;
                    return (
                      <ProgressMeter
                        key={status}
                        label={statusLabel(status)}
                        valueLabel={`${count} / ${requestTotal}`}
                        value={count}
                        max={Math.max(requestTotal, 1)}
                        tone={status === 'COMPLETE' ? 'success' : status === 'UNDER_REVIEW' ? 'warning' : 'brand'}
                      />
                    );
                  })}
                </div>
              </Card>

              <Card eyebrow="Billing" title="Account">
                {!summary ? (
                  <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>
                    {isPending ? 'Loading…' : 'Unavailable'}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                      <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>Outstanding</span>
                      <span style={{ font: 'var(--weight-semibold) var(--text-sm)/1.3 var(--font-body)' }}>
                        {formatMoney(summary.payments.outstandingMinor, summary.payments.currency)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                      <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>Settled</span>
                      <span style={{ font: 'var(--weight-semibold) var(--text-sm)/1.3 var(--font-body)' }}>
                        {formatMoney(summary.payments.settledMinor, summary.payments.currency)}
                      </span>
                    </div>
                  </div>
                )}
              </Card>

              {expiring.length > 0 && (
                <Card eyebrow="Expiring" title="Certificates due">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {expiring.slice(0, 5).map((certificate, index) => (
                      <div
                        key={certificate.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 'var(--space-3)',
                          padding: 'var(--space-2-5) 0',
                          borderTop: index ? '1px solid var(--border-subtle)' : 0,
                        }}
                      >
                        <span style={{ font: 'var(--type-body-sm)' }}>
                          {certificate.request.employee.fullName}
                        </span>
                        <span style={{ font: 'var(--type-caption)', color: 'var(--text-warning)' }}>
                          {relativeDays(certificate.expiryDate)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
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
