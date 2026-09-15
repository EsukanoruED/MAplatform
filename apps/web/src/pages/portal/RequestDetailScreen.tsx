import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, DataTable, Icon } from '../../components';
import { PortalBody, PortalTopBar } from '../../layouts/PortalLayout';
import { useRequest } from '../../lib/queries/requests';
import { useTransitionRequest, useUploadRequestDocument } from '../../lib/queries/workflow';
import { ApiError, api } from '../../lib/api';
import type { Payment, RequestDocument } from '../../lib/api';
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
import { EmptyState, ErrorState, LoadingState } from './ui-states';
import { StatusTimeline } from './StatusTimeline';

/**
 * One request, end to end: the record, its persisted status timeline, the
 * documents attached to it, the ledger rows against it, and the lab it was
 * dispatched to.
 *
 * The action buttons are driven by `availableTransitions` from the API — the
 * same actor-permission matrix the write endpoint enforces — so the UI can never
 * offer a move the server would refuse.
 */
export function RequestDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useRequest(id);
  const transition = useTransitionRequest(id ?? '');
  const uploadDocument = useUploadRequestDocument(id ?? '');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
              title="No such request in your company"
              body="This request id does not belong to your company, or the record has been removed."
              action={
                <Button size="sm" variant="secondary" onClick={() => navigate('/portal/requests')}>
                  Back to requests
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

  const withdraw = async () => {
    setActionError(null);
    setNotice(null);
    try {
      await transition.mutateAsync({ status: 'REJECTED', note: 'Withdrawn by the company.' });
      setNotice('Request withdrawn.');
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'The request could not be withdrawn.');
    }
  };

  const onFileChosen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setActionError(null);
    setNotice(null);
    try {
      await uploadDocument.mutateAsync(file);
      setNotice(`${file.name} attached.`);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'The file could not be attached.');
    }
  };

  const canWithdraw = availableTransitions.includes('REJECTED');

  return (
    <>
      <PortalTopBar
        title={reference}
        crumbs={[{ label: 'Requests', href: '/portal/requests' }, reference]}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button
              size="sm"
              variant="secondary"
              iconStart={<Icon name="file-text" size={15} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadDocument.isPending}
            >
              {uploadDocument.isPending ? 'Attaching…' : 'Attach file'}
            </Button>
            {canWithdraw && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => void withdraw()}
                disabled={transition.isPending}
              >
                {transition.isPending ? 'Withdrawing…' : 'Withdraw'}
              </Button>
            )}
          </div>
        }
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
                      ['Type', typeLabel(request.type), false],
                      ['Worker', request.employee.fullName, false],
                      ['Site', request.employee.site ?? '—', false],
                      ['Company', request.company.legalName, false],
                      ['Laboratory', request.assignedLab?.name ?? 'Not assigned', false],
                      ['Submitted', formatDate(request.createdAt), false],
                      ['Last updated', formatDate(request.updatedAt), false],
                      ['Filed by', request.createdBy?.name ?? '—', false],
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
                      Notes
                    </div>
                    <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>
                      {request.notes}
                    </p>
                  </div>
                )}
              </Card>

              <Card eyebrow="Documents" title="Attached files" padding="var(--space-5)">
                {request.documents.length === 0 ? (
                  <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
                    No documents attached yet. Results and certificates are issued by Medical Alliance.
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
                        {
                          key: 'download',
                          header: '',
                          align: 'end',
                          render: (d) => (
                            <a
                              href={api.documentDownloadUrl(d.id)}
                              style={{ font: 'var(--weight-semibold) var(--text-xs)/1 var(--font-body)' }}
                            >
                              Download
                            </a>
                          ),
                        },
                      ]}
                      rows={request.documents as Array<RequestDocument & Record<string, unknown>>}
                    />
                  </div>
                )}
              </Card>

              <Card eyebrow="Billing" title="Payments" padding="var(--space-5)">
                {request.payments.length === 0 ? (
                  <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
                    No charges recorded against this request.
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
                        { key: 'paidAt', header: 'Settled', numeric: true, render: (p) => formatDate(p.paidAt) },
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
                {request.paymentStatus === 'PENDING' && (
                  <p style={{ font: 'var(--type-caption)', color: 'var(--text-warning)', marginTop: 'var(--space-2)' }}>
                    Awaiting payment before approval.
                  </p>
                )}
              </Card>

              <Card eyebrow="History" title="Status timeline" padding="var(--space-5)">
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <StatusTimeline events={request.statusEvents} />
                </div>
              </Card>

              {request.labNotifications.length > 0 && (
                <Card eyebrow="Laboratory" title="Dispatch" padding="var(--space-5)">
                  {request.labNotifications.map((dispatch) => (
                    <div key={dispatch.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ font: 'var(--type-body-sm)' }}>{dispatch.lab.name}</div>
                      <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                        Queued {formatDate(dispatch.createdAt)}
                        {dispatch.sentAt ? ` · sent ${formatDate(dispatch.sentAt)}` : ' · not yet sent'}
                      </div>
                    </div>
                  ))}
                  <p style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
                    Lab email delivery is not configured yet, so dispatches are recorded but not sent.
                  </p>
                </Card>
              )}

              <Button variant="ghost" onClick={() => navigate('/portal/requests')} iconStart={<Icon name="arrow-left" size={16} />}>
                Back to requests
              </Button>
            </div>
          </div>
        </div>
      </PortalBody>

      {/* Hidden control so "Attach file" can use the design system's Button. */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
        onChange={(e) => void onFileChosen(e)}
      />
    </>
  );
}
