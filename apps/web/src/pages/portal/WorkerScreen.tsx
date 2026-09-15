import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Card, DataTable, Icon, IconButton, Tag } from '../../components';
import { PortalBody, PortalTopBar } from '../../layouts/PortalLayout';
import { useEmployee, useUpdateEmployee } from '../../lib/queries/employees';
import { ApiError } from '../../lib/api';
import type { MedicalRequest } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { formatDate, requestReference, statusLabel, statusTone, typeLabel } from '../../lib/format';
import { EmptyState, ErrorState, LoadingState } from './ui-states';
import { EmployeeFormModal } from './EmployeeFormModal';
import { NewRequestModal } from './NewRequestModal';

/**
 * One worker's record.
 *
 * Phase 2 replaces the Phase 1 read-only shell with the real thing: the record
 * comes from GET /api/employees/:id (tenant-scoped), the examination list is
 * that worker's actual requests, and the record can be edited or archived.
 *
 * The clinical-notes and attachments panels the prototype sketched are gone
 * rather than faked — the Phase 2 schema has no clinical-note model, and
 * documents belong to a request, where they are now shown for real.
 */
export function WorkerScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editing, setEditing] = React.useState(false);
  const [requesting, setRequesting] = React.useState(false);

  const { data, isPending, isError, error, refetch } = useEmployee(id);
  const updateEmployee = useUpdateEmployee(id ?? '');

  const canEdit = user?.type === 'company' && user.role === 'COMPANY_ADMIN';

  if (isPending) {
    return (
      <>
        <PortalTopBar title="Worker" />
        <PortalBody>
          <LoadingState label="Loading worker record…" />
        </PortalBody>
      </>
    );
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <>
        <PortalTopBar title={notFound ? 'Worker not found' : 'Worker'} />
        <PortalBody>
          {notFound ? (
            <EmptyState
              title="No such worker in your company"
              body="This worker id does not belong to your company, or the record has been removed."
              action={
                <Button size="sm" variant="secondary" onClick={() => navigate('/portal/workers')}>
                  Back to workers
                </Button>
              }
            />
          ) : (
            <ErrorState
              message={error instanceof ApiError ? error.message : 'The worker record could not be loaded.'}
              onRetry={() => void refetch()}
            />
          )}
        </PortalBody>
      </>
    );
  }

  const { employee, requests } = data;
  const rows = requests as Array<MedicalRequest & Record<string, unknown>>;

  const toggleArchived = async () => {
    await updateEmployee.mutateAsync({ active: !employee.active });
  };

  return (
    <>
      <PortalTopBar
        title={employee.fullName}
        crumbs={[
          { label: 'Workers', href: '/portal/workers' },
          ...(employee.site ? [{ label: employee.site }] : []),
        ]}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {canEdit && (
              <IconButton
                label="Edit worker"
                variant="secondary"
                icon={<Icon name="settings" size={17} />}
                onClick={() => setEditing(true)}
              />
            )}
            <Button size="sm" onClick={() => setRequesting(true)} disabled={!employee.active}>
              New examination
            </Button>
          </div>
        }
      />
      <PortalBody>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-5)', alignItems: 'start', maxWidth: 1180 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Card padding="0">
              <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--border-subtle)' }}>
                <h2 style={{ font: 'var(--type-heading-4)' }}>
                  Examinations
                  <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)', marginInlineStart: 'var(--space-2)' }}>
                    {rows.length}
                  </span>
                </h2>
              </div>
              <div style={{ padding: 'var(--space-5)' }}>
                {rows.length === 0 ? (
                  <EmptyState
                    title="No examinations recorded"
                    body="Requests filed for this worker appear here with their reference and current status."
                    action={
                      <Button size="sm" onClick={() => setRequesting(true)} disabled={!employee.active}>
                        New examination
                      </Button>
                    }
                  />
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <DataTable<MedicalRequest & Record<string, unknown>>
                      dense
                      style={{ border: 0, borderRadius: 0 }}
                      onRowClick={(r) => navigate(`/portal/requests/${r.id}`)}
                      columns={[
                        {
                          key: 'ref',
                          header: 'Reference',
                          mono: true,
                          width: '150px',
                          render: (r) => requestReference(r.id, r.createdAt),
                        },
                        { key: 'type', header: 'Type', render: (r) => typeLabel(r.type) },
                        {
                          key: 'createdAt',
                          header: 'Submitted',
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
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card tone="sunken" eyebrow="Record" padding="var(--space-5)">
              <Badge tone={employee.active ? 'success' : 'neutral'} dot>
                {employee.active ? 'Active' : 'Archived'}
              </Badge>
              <div style={{ display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                {(
                  [
                    ['Worker number', employee.nationalId, true],
                    ['Job title', employee.role ?? '—', false],
                    ['Site', employee.site ?? '—', false],
                    ['Date of birth', formatDate(employee.dateOfBirth), false],
                    ['Registered', formatDate(employee.createdAt), false],
                  ] as Array<[string, string, boolean]>
                ).map(([label, value, mono]) => (
                  <div key={label}>
                    <div style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      {label}
                    </div>
                    <div style={{ font: mono ? 'var(--type-mono)' : 'var(--type-body)', marginTop: 3 }}>{value}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card eyebrow="Surveillance" title="Programme" padding="var(--space-5)">
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {['Audiometry', 'Spirometry', 'Vision', 'Heat stress'].map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
              <p style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
                Indicative programme. Per-worker surveillance scheduling is not modelled yet.
              </p>
            </Card>

            {canEdit && (
              <Button
                variant="secondary"
                onClick={() => void toggleArchived()}
                disabled={updateEmployee.isPending}
              >
                {employee.active ? 'Archive worker' : 'Restore worker'}
              </Button>
            )}
            <Button variant="ghost" onClick={() => navigate('/portal/workers')} iconStart={<Icon name="arrow-left" size={16} />}>
              Back to workers
            </Button>
          </div>
        </div>
      </PortalBody>

      <EmployeeFormModal open={editing} onClose={() => setEditing(false)} employee={employee} />
      <NewRequestModal
        open={requesting}
        onClose={() => setRequesting(false)}
        defaultEmployeeId={employee.id}
      />
    </>
  );
}
