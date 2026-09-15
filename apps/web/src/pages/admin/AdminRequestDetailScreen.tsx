import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, DataTable, Icon, SelectField, TextField } from '../../components';
import { PortalBody, PortalTopBar } from '../../layouts/PortalLayout';
import {
  useAdminAssignLab,
  useAdminRequest,
  useAdminTransitionRequest,
  useLabs,
} from '../../lib/queries/workflow';
import { ApiError } from '../../lib/api';
import type { Payment, RequestDocument, RequestStatus } from '../../lib/api';
import {
  documentTypeLabel,
  formatBytes,
  formatDate,
  formatMoney,
  paymentStatusLabel,
  paymentStatusTone,
  requestReference,
  statusLabel,
  statusTone,
  typeLabel,
} from '../../lib/format';
import { EmptyState, ErrorState, LoadingState } from './../portal/ui-states';
import { StatusTimeline } from './../portal/StatusTimeline';

/**
 * Staff review of one request, across any company.
 *
 * The workflow actions offered come from `availableTransitions` in the API
 * response — the server's own actor-permission matrix — rather than a list
 * hard-coded here. Hiding a button is never the control: the same matrix is
 * enforced inside the transition transaction.
 */
export function AdminRequestDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isPending, isError, error, refetch } = useAdminRequest(id);
  const { data: labData } = useLabs();
  const transition = useAdminTransitionRequest(id ?? '');
  const assignLab = useAdminAssignLab(id ?? '');

  const [note, setNote] = React.useState('');
  const [labId, setLabId] = React.useState('');
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  if (isPending) {
    return (
      <>
        <PortalTopBar title="Request" />
        <PortalBody>
          <LoadingState label="Loading request…" />
        </PortalBody>
      </>
    );
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <>
        <PortalTopBar title={notFound ? 'Request not found' : 'Request'} />
        <PortalBody>
          {notFound ? (
            <EmptyState
              title="No such request"
              body="This request id does not exist."
              action={
                <Button size="sm" variant="secondary" onClick={() => navigate('/admin/requests')}>
                  Back to the queue
                </Button>
              }
            />
          ) : (
            <ErrorState
              message={error instanceof ApiError ? error.message : 'The request could not be loaded.'}
              onRetry={() => void refetch()}
            />
          )}
        </PortalBody>
      </>
    );
  }

  const { request, availableTransitions } = data;
  const reference = requestReference(request.id, request.createdAt);
  const labs = labData?.labs ?? [];

  const move = async (status: RequestStatus) => {
    setActionError(null);
    setNotice(null);
    try {
      await transition.mutateAsync({
        status,
        ...(note.trim() ? { note: note.trim() } : {}),
        // Sending to the lab needs one assigned; offer the picked one if the
        // request does not already carry it.
        ...(status === 'AT_LAB' && !request.assignedLabId && labId ? { assignedLabId: labId } : {}),
      });
      setNote('');
      setNotice(`Moved to ${statusLabel(status)}.`);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'The request could not be moved.');
    }
  };

  const saveLab = async () => {
    if (!labId) return;
    setActionError(null);
    setNotice(null);
    try {
      await assignLab.mutateAsync(labId);
      setNotice('Laboratory assigned.');
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'The laboratory could not be assigned.');
    }
  };

  const busy = transition.isPending || assignLab.isPending;

  return (
    <>
      <PortalTopBar
        title={reference}
        crumbs={[{ label: 'Request queue', href: '/admin/requests' }, request.company.legalName]}
      />
      <PortalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 1180 }}>
          {actionError && (
            <Alert tone="danger" title="Could not complete that action" icon={<Icon name="triangle-alert" size={18} />}>
              {actionError}
            </Alert>
          )}
          {notice && (
            <Alert tone="success" title={notice} icon={<Icon name="check" size={18} />} onDismiss={() => setNotice(null)} />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-5)', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <Card eyebrow="Request" title="Details" padding="var(--space-5)">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                  {(
                    [
                      ['Reference', reference, true],
                      ['Company', request.company.legalName, false],
                      ['Billing', request.company.billingType === 'SETTLEMENT' ? 'Settlement' : 'Per request', false],
                      ['Type', typeLabel(request.type), false],
                      ['Worker', request.employee.fullName, false],
                      ['Site', request.employee.site ?? '—', false],
                      ['Laboratory', request.assignedLab?.name ?? 'Not assigned', false],
                      ['Payment', paymentStatusLabel(request.paymentStatus), false],
                      ['Submitted', formatDate(request.createdAt), false],
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
                {request.notes && (
                  <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Notes from the company
                    </div>
                    <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>{request.notes}</p>
                  </div>
                )}
              </Card>

              <Card eyebrow="Documents" title="Files on this request" padding="var(--space-5)">
                {request.documents.length === 0 ? (
                  <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
                    No documents yet.
                  </p>
                ) : (
                  <div style={{ overflowX: 'auto', marginTop: 'var(--space-2)' }}>
                    <DataTable<RequestDocument & Record<string, unknown>>
                      dense
                      style={{ border: 0, borderRadius: 0 }}
                      columns={[
                        { key: 'fileName', header: 'File' },
                        { key: 'type', header: 'Kind', render: (d) => documentTypeLabel(d.type) },
                        { key: 'byteSize', header: 'Size', numeric: true, render: (d) => formatBytes(d.byteSize) },
                        { key: 'uploadedAt', header: 'Added', numeric: true, render: (d) => formatDate(d.uploadedAt) },
                      ]}
                      rows={request.documents as Array<RequestDocument & Record<string, unknown>>}
                    />
                  </div>
                )}
                <p style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
                  Results and certificates are uploaded through the API
                  (POST /api/admin/requests/:id/documents). A staff upload screen is not part of Phase 2.
                </p>
              </Card>

              <Card eyebrow="Billing" title="Payments" padding="var(--space-5)">
                {request.payments.length === 0 ? (
                  <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
                    No charges recorded.
                  </p>
                ) : (
                  <div style={{ overflowX: 'auto', marginTop: 'var(--space-2)' }}>
                    <DataTable<Payment & Record<string, unknown>>
                      dense
                      style={{ border: 0, borderRadius: 0 }}
                      columns={[
                        { key: 'amountMinor', header: 'Amount', numeric: true, render: (p) => formatMoney(p.amountMinor, p.currency) },
                        { key: 'method', header: 'Arrangement', render: (p) => (p.method === 'SETTLEMENT' ? 'Settlement' : 'Per request') },
                        {
                          key: 'status',
                          header: 'Status',
                          render: (p) => (
                            <Badge tone={paymentStatusTone(p.status)} dot>
                              {paymentStatusLabel(p.status)}
                            </Badge>
                          ),
                        },
                      ]}
                      rows={request.payments as Array<Payment & Record<string, unknown>>}
                    />
                  </div>
                )}
              </Card>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Card tone="sunken" eyebrow="Current status" padding="var(--space-5)">
                <Badge tone={statusTone(request.status)} dot>
                  {statusLabel(request.status)}
                </Badge>
                <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
                  Updated {formatDate(request.updatedAt)}
                </div>
              </Card>

              <Card eyebrow="Workflow" title="Move this request" padding="var(--space-5)">
                {availableTransitions.length === 0 ? (
                  <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
                    This request is closed. No further transitions are possible.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                    {availableTransitions.includes('AT_LAB') && !request.assignedLabId && (
                      <SelectField
                        label="Laboratory"
                        required
                        value={labId}
                        onChange={(e) => setLabId(e.target.value)}
                        placeholder="Select a laboratory"
                        options={labs.map((lab) => ({ value: lab.id, label: lab.name }))}
                        hint="Required before the request can go to the lab."
                      />
                    )}
                    <TextField
                      label="Note"
                      multiline
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Recorded on the status timeline"
                      hint="Optional."
                    />
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      {availableTransitions.map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={status === 'REJECTED' ? 'danger' : 'primary'}
                          onClick={() => void move(status)}
                          disabled={busy}
                        >
                          {statusLabel(status)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              <Card eyebrow="Laboratory" title="Assignment" padding="var(--space-5)">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                  <SelectField
                    label="Assign to"
                    value={labId}
                    onChange={(e) => setLabId(e.target.value)}
                    placeholder={request.assignedLab?.name ?? 'Select a laboratory'}
                    options={labs.map((lab) => ({ value: lab.id, label: lab.name }))}
                  />
                  <Button size="sm" variant="secondary" onClick={() => void saveLab()} disabled={busy || !labId}>
                    {assignLab.isPending ? 'Assigning…' : 'Assign laboratory'}
                  </Button>
                </div>
              </Card>

              <Card eyebrow="History" title="Status timeline" padding="var(--space-5)">
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <StatusTimeline events={request.statusEvents} />
                </div>
              </Card>

              <Button variant="ghost" onClick={() => navigate('/admin/requests')} iconStart={<Icon name="arrow-left" size={16} />}>
                Back to the queue
              </Button>
            </div>
          </div>
        </div>
      </PortalBody>
    </>
  );
}
