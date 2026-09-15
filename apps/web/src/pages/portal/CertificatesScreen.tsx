import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, DataTable, Icon, ProgressMeter, SelectField, Tag, TextField } from '../../components';
import { PortalBody, PortalTopBar } from '../../layouts/PortalLayout';
import { useCertificates } from '../../lib/queries/workflow';
import { ApiError, api } from '../../lib/api';
import type { MedicalRequest, RequestDocument, RequestStatus } from '../../lib/api';
import {
  EXPIRY_WARNING_DAYS,
  expiryLabel,
  expiryTone,
  formatDate,
  requestReference,
  statusLabel,
  statusTone,
} from '../../lib/format';
import { EmptyState, ErrorState, LoadingState } from './ui-states';

/**
 * The certificate register.
 *
 * Backed by GET /api/certificates, which returns two halves: the issued
 * certificates (Document rows of type CERTIFICATE, tenant-scoped by their own
 * companyId column) and the fitness-certificate requests still in the pipeline.
 *
 * Both halves are listed on purpose. A register showing only issued certificates
 * would overstate coverage — an in-flight examination is exactly what a safety
 * officer needs to see.
 */
type RegisterRow = {
  id: string;
  requestId: string;
  worker: string;
  site: string | null;
  createdAt: string;
  status: RequestStatus;
  certificate: RequestDocument | null;
} & Record<string, unknown>;

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'issued', label: 'Issued' },
  { value: 'expiring', label: 'Expiring soon' },
  { value: 'expired', label: 'Expired' },
  { value: 'pending', label: 'Not yet issued' },
];

export function CertificatesScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [site, setSite] = React.useState('');
  const [filter, setFilter] = React.useState('');

  const { data, isPending, isError, error, refetch } = useCertificates();

  /**
   * One row per fitness-certificate request, with its issued certificate
   * attached when there is one. Pairing here (rather than listing the two
   * halves separately) means a request never appears twice, and a request that
   * completed without a certificate on file is still visible.
   */
  const rows: RegisterRow[] = React.useMemo(() => {
    const newestByRequest = new Map<string, RequestDocument>();
    for (const certificate of data?.certificates ?? []) {
      const existing = newestByRequest.get(certificate.requestId);
      if (!existing || certificate.uploadedAt > existing.uploadedAt) {
        newestByRequest.set(certificate.requestId, certificate);
      }
    }

    return (data?.requests ?? []).map((request: MedicalRequest) => ({
      id: request.id,
      requestId: request.id,
      worker: request.employee.fullName,
      site: request.employee.site,
      createdAt: request.createdAt,
      status: request.status,
      certificate: newestByRequest.get(request.id) ?? null,
    }));
  }, [data]);

  const sites = React.useMemo(
    () => [...new Set(rows.map((r) => r.site).filter((s): s is string => Boolean(s)))].sort(),
    [rows],
  );

  /**
   * Days until expiry, measured against a clock captured once per recomputation
   * rather than read during render — reading Date.now() while rendering makes
   * the derived buckets unstable across re-renders.
   */
  const daysUntil = (iso: string | null | undefined, now: number) =>
    iso ? Math.round((new Date(iso).getTime() - now) / 86_400_000) : null;

  const filtered = React.useMemo(() => {
    const now = Date.now();
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (site && row.site !== site) return false;

      if (filter) {
        const days = daysUntil(row.certificate?.expiryDate, now);
        if (filter === 'pending' && row.certificate) return false;
        if (filter === 'issued' && !row.certificate) return false;
        if (filter === 'expiring' && (days === null || days < 0 || days > EXPIRY_WARNING_DAYS)) return false;
        if (filter === 'expired' && (days === null || days >= 0)) return false;
      }

      if (!term) return true;
      return (
        row.worker.toLowerCase().includes(term) ||
        requestReference(row.requestId, row.createdAt).toLowerCase().includes(term) ||
        (row.site ?? '').toLowerCase().includes(term)
      );
    });
  }, [rows, search, site, filter]);

  const { issued, expiringSoon, expired } = React.useMemo(() => {
    const now = Date.now();
    return {
      issued: rows.filter((r) => r.certificate).length,
      expiringSoon: rows.filter((r) => {
        const days = daysUntil(r.certificate?.expiryDate, now);
        return days !== null && days >= 0 && days <= EXPIRY_WARNING_DAYS;
      }).length,
      expired: rows.filter((r) => {
        const days = daysUntil(r.certificate?.expiryDate, now);
        return days !== null && days < 0;
      }).length,
    };
  }, [rows]);

  const hasFilters = Boolean(search.trim() || site || filter);
  const clearFilters = () => {
    setSearch('');
    setSite('');
    setFilter('');
  };

  return (
    <>
      <PortalTopBar
        title="Certificates"
        actions={
          <Button size="sm" variant="secondary" iconStart={<Icon name="download" size={15} />} disabled>
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
                  placeholder="Certificate, worker or site"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  iconStart={<Icon name="search" size={16} />}
                />
                <SelectField
                  label="Site"
                  placeholder="All sites"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  options={sites}
                />
                <SelectField
                  label="Status"
                  placeholder="All statuses"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  options={STATUS_FILTERS}
                />
              </div>
              {hasFilters && (
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>Active filters</span>
                  {search.trim() && <Tag onRemove={() => setSearch('')}>{`“${search.trim()}”`}</Tag>}
                  {site && <Tag onRemove={() => setSite('')}>{site}</Tag>}
                  {filter && (
                    <Tag onRemove={() => setFilter('')}>
                      {STATUS_FILTERS.find((f) => f.value === filter)?.label ?? filter}
                    </Tag>
                  )}
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
            ) : rows.length === 0 ? (
              <EmptyState
                title="No certificate requests yet"
                body="Once you request a fitness certificate for a worker it appears in this register, along with its status and the issued certificate when it is ready."
                action={
                  <Button size="sm" onClick={() => navigate('/portal/requests')} iconStart={<Icon name="plus" size={15} />}>
                    Go to requests
                  </Button>
                }
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No records match these filters"
                body="Clear or widen the filters above to see the rest of the register."
                action={
                  <Button size="sm" variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <DataTable<RegisterRow>
                  caption={`Certificate register — ${rows.length} record${rows.length === 1 ? '' : 's'}, ${filtered.length} shown`}
                  onRowClick={(r) => navigate(`/portal/requests/${r.requestId}`)}
                  columns={[
                    {
                      key: 'ref',
                      header: 'Reference',
                      mono: true,
                      width: '150px',
                      render: (r) => requestReference(r.requestId, r.createdAt),
                    },
                    { key: 'worker', header: 'Worker', render: (r) => r.worker },
                    { key: 'site', header: 'Site', render: (r) => r.site ?? '—' },
                    {
                      key: 'expires',
                      header: 'Expires',
                      align: 'end',
                      numeric: true,
                      render: (r) => (r.certificate?.expiryDate ? formatDate(r.certificate.expiryDate) : '—'),
                    },
                    {
                      key: 'certificate',
                      header: 'Certificate',
                      render: (r) =>
                        r.certificate ? (
                          <Badge tone={expiryTone(r.certificate.expiryDate)} dot>
                            {expiryLabel(r.certificate.expiryDate)}
                          </Badge>
                        ) : (
                          <Badge tone={statusTone(r.status)} dot>
                            {statusLabel(r.status)}
                          </Badge>
                        ),
                    },
                    {
                      key: 'download',
                      header: '',
                      align: 'end',
                      render: (r) =>
                        r.certificate ? (
                          <a
                            href={api.documentDownloadUrl(r.certificate.id)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ font: 'var(--weight-semibold) var(--text-xs)/1 var(--font-body)' }}
                          >
                            Download
                          </a>
                        ) : null,
                    },
                  ]}
                  rows={filtered}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card eyebrow="Register health" padding="var(--space-5)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <ProgressMeter
                  label="Issued"
                  valueLabel={`${issued} / ${rows.length}`}
                  value={issued}
                  max={Math.max(rows.length, 1)}
                  tone="success"
                />
                <ProgressMeter
                  label={`Expiring in ${EXPIRY_WARNING_DAYS} days`}
                  valueLabel={`${expiringSoon} / ${rows.length}`}
                  value={expiringSoon}
                  max={Math.max(rows.length, 1)}
                  tone="warning"
                />
                <ProgressMeter
                  label="Expired"
                  valueLabel={`${expired} / ${rows.length}`}
                  value={expired}
                  max={Math.max(rows.length, 1)}
                  tone="danger"
                />
              </div>
            </Card>

            <Card eyebrow="How certificates are issued" padding="var(--space-5)">
              <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
                A certificate is issued by Medical Alliance once the examination has been reviewed.
                It then appears here against the request, with its expiry date.
              </p>
            </Card>
          </div>
        </div>
      </PortalBody>
    </>
  );
}
