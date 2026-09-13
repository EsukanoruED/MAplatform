import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert, Badge, Button, Card, DataTable, Icon, IconButton, Radio, Tabs, Tag, TextField,
} from '../../components';
import { PortalBody, PortalTopBar } from '../../layouts/PortalLayout';
import { useEmployees, useRequests } from '../../lib/queries/requests';
import { ApiError } from '../../lib/api';
import type { MedicalRequest } from '../../lib/api';
import { formatDate, requestReference, statusLabel, statusTone, typeLabel } from '../../lib/format';
import { EmptyState, ErrorState, LoadingState } from './ui-states';

/**
 * Migrated from ui_kits/portal/WorkerScreen.jsx.
 *
 * Adaptations:
 *  - The prototype received the worker through an `onOpenWorker(w)` callback and
 *    went back via `onBack()`. The worker is now identified by the :id route
 *    param and resolved from GET /api/employees; "Back to dashboard" is a
 *    navigate('/portal') call.
 *  - The Examinations and Certificates tabs read the worker's real requests
 *    instead of a fixed four-row array.
 *  - Clinical notes and attachments remain static, and say so. Both need models
 *    the Phase 1 schema does not define (Document, clinical notes), so inventing
 *    live data for them would misrepresent what the platform stores.
 *  - The "Issue certificate" modal still only confirms locally: the status
 *    transition endpoint (PATCH /api/requests/:id/status) is Phase 2 work.
 */

type TabKey = 'overview' | 'exams' | 'certs' | 'notes';

export function WorkerScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<TabKey>('overview');
  const [outcome, setOutcome] = React.useState('restricted');

  const { data: employeeData, isPending: employeesPending, isError: employeesError, error: employeesErr, refetch } = useEmployees();
  const { data: requestData, isPending: requestsPending } = useRequests();

  const worker = employeeData?.employees.find((e) => e.id === id);
  const workerRequests = (requestData?.requests ?? []).filter((r) => r.employeeId === id);
  const latest = workerRequests[0];

  if (employeesPending) {
    return (
      <>
        <PortalTopBar title="Worker" />
        <PortalBody><LoadingState label="Loading worker record…" /></PortalBody>
      </>
    );
  }

  if (employeesError) {
    return (
      <>
        <PortalTopBar title="Worker" />
        <PortalBody>
          <ErrorState
            message={employeesErr instanceof ApiError ? employeesErr.message : 'The worker record could not be loaded.'}
            onRetry={() => void refetch()}
          />
        </PortalBody>
      </>
    );
  }

  if (!worker) {
    return (
      <>
        <PortalTopBar title="Worker not found" crumbs={[{ label: 'Workers', href: '/portal/workers' }]} />
        <PortalBody>
          <EmptyState
            title="No such worker in your company"
            body="This worker id does not belong to your company, or the record has been removed."
            action={<Button size="sm" variant="secondary" onClick={() => navigate('/portal/workers')}>Back to workers</Button>}
          />
        </PortalBody>
      </>
    );
  }

  const tableRows = (tab === 'certs'
    ? workerRequests.filter((r) => r.type === 'FITNESS_CERTIFICATE')
    : workerRequests) as Array<MedicalRequest & Record<string, unknown>>;

  return (
    <>
      <PortalTopBar
        title={worker.fullName}
        crumbs={[
          { label: 'Workers', href: '/portal/workers' },
          ...(worker.site ? [{ label: worker.site }] : []),
        ]}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <IconButton label="Print record" variant="secondary" icon={<Icon name="printer" size={17} />} />
            <Button size="sm" onClick={() => navigate('/portal/certificates')}>View register</Button>
          </div>
        }
      />
      <PortalBody>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-5)', alignItems: 'start', maxWidth: 1180 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {latest?.status === 'REJECTED' && (
              <Alert tone="danger" title="Latest request rejected" icon={<Icon name="triangle-alert" size={18} />}>
                The most recent examination request for this worker was rejected. Review the register for the reason.
              </Alert>
            )}
            <Card padding="0">
              <div style={{ padding: 'var(--space-5) var(--space-5) 0' }}>
                <Tabs
                  value={tab}
                  onChange={(v) => setTab(v as TabKey)}
                  items={[
                    { value: 'overview', label: 'Overview' },
                    { value: 'exams', label: 'Examinations', count: workerRequests.length },
                    { value: 'certs', label: 'Certificates', count: workerRequests.filter((r) => r.type === 'FITNESS_CERTIFICATE').length },
                    { value: 'notes', label: 'Clinical notes' },
                  ]}
                />
              </div>
              <div style={{ padding: 'var(--space-5)' }}>
                {tab === 'exams' || tab === 'certs' ? (
                  requestsPending ? (
                    <LoadingState label="Loading requests…" />
                  ) : tableRows.length === 0 ? (
                    <EmptyState
                      title={tab === 'certs' ? 'No certificate requests for this worker' : 'No examinations recorded'}
                      body="Submitted requests for this worker will be listed here with their reference and current status."
                    />
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <DataTable<MedicalRequest & Record<string, unknown>>
                        dense
                        style={{ border: 0, borderRadius: 0 }}
                        columns={[
                          { key: 'ref', header: tab === 'certs' ? 'Certificate' : 'Reference', mono: true, width: '150px', render: (r) => requestReference(r.id, r.createdAt) },
                          { key: 'type', header: 'Type', render: (r) => typeLabel(r.type) },
                          { key: 'createdAt', header: 'Date', numeric: true, render: (r) => formatDate(r.createdAt) },
                          { key: 'status', header: 'Result', render: (r) => <Badge tone={statusTone(r.status)} dot>{statusLabel(r.status)}</Badge> },
                        ]}
                        rows={tableRows}
                      />
                    </div>
                  )
                ) : tab === 'notes' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <TextField label="Add a clinical note" multiline rows={3} placeholder="Findings, restrictions, review interval" disabled />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="secondary" disabled>Save note</Button>
                    </div>
                    <Alert tone="info" title="Clinical notes are not stored yet" icon={<Icon name="construction" size={18} />}>
                      The Phase 1 schema does not model clinical notes. This panel keeps the prototype's layout so the
                      note model can be added in Phase 2 without redesigning the screen.
                    </Alert>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-5) var(--space-8)' }}>
                    {([
                      ['Worker', worker.fullName, false],
                      ['Site', worker.site ?? '—', false],
                      ['Role', worker.role ?? '—', false],
                      ['Requests on file', String(workerRequests.length), true],
                      ['Latest request', latest ? requestReference(latest.id, latest.createdAt) : '—', true],
                      ['Latest status', latest ? statusLabel(latest.status) : '—', false],
                      ['Submitted', latest ? formatDate(latest.createdAt) : '—', false],
                      ['Last updated', latest ? formatDate(latest.updatedAt) : '—', false],
                    ] as Array<[string, string, boolean]>).map(([k, v, mono]) => (
                      <div key={k}>
                        <div style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{k}</div>
                        <div style={{ font: mono ? 'var(--type-mono)' : 'var(--type-body)', marginTop: 3 }}>{v}</div>
                      </div>
                    ))}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Surveillance programme</div>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {['Audiometry', 'Spirometry', 'Vision', 'Heat stress', 'Biological monitoring'].map((t) => <Tag key={t}>{t}</Tag>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card tone="sunken" eyebrow="Current status" padding="var(--space-5)">
              {latest ? (
                <>
                  <Badge tone={statusTone(latest.status)} dot>{statusLabel(latest.status)}</Badge>
                  <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
                    {typeLabel(latest.type)} · submitted {formatDate(latest.createdAt)}
                  </div>
                </>
              ) : (
                <div style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
                  No requests on file for this worker yet.
                </div>
              )}
            </Card>
            <Card eyebrow="This visit" title="Record outcome" padding="var(--space-5)">
              <Radio
                name="outcome"
                value={outcome}
                onChange={setOutcome}
                style={{ marginTop: 'var(--space-2)' }}
                options={[
                  { value: 'fit', label: 'Fit for duty' },
                  { value: 'restricted', label: 'Fit with restrictions', description: 'Record the restriction and review date' },
                  { value: 'unfit', label: 'Not fit' },
                ]}
              />
              <Button fullWidth style={{ marginTop: 'var(--space-4)' }} disabled>Save and issue</Button>
              <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                Recording an outcome needs the status-transition endpoint, which is Phase 2 work.
              </div>
            </Card>
            <Button variant="ghost" onClick={() => navigate('/portal')} iconStart={<Icon name="arrow-left" size={16} />}>
              Back to dashboard
            </Button>
          </div>
        </div>
      </PortalBody>
    </>
  );
}
