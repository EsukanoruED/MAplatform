import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, DataTable, Icon, SelectField, Tag, TextField } from '../../components';
import { PortalBody, PortalTopBar } from '../../layouts/PortalLayout';
import { useEmployeeList } from '../../lib/queries/employees';
import { useRequests } from '../../lib/queries/requests';
import { ApiError } from '../../lib/api';
import type { Employee } from '../../lib/api';
import { statusLabel, statusTone } from '../../lib/format';
import { EmptyState, ErrorState, LoadingState } from './ui-states';
import { EmployeeFormModal } from './EmployeeFormModal';

/**
 * The worker register.
 *
 * Phase 2 turns the read-only Phase 1 list into real employee management:
 * server-side search and filtering, registration, and a route into each record.
 * The data comes from GET /api/employees, which the server scopes to the
 * signed-in company.
 */
type Row = Employee & Record<string, unknown>;

export function WorkersScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [site, setSite] = React.useState('');
  const [active, setActive] = React.useState<'true' | 'false' | 'all'>('true');
  const [creating, setCreating] = React.useState(false);

  // Debounced so typing doesn't fire a request per keystroke.
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const filters = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(site ? { site } : {}),
    active,
  };

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useEmployeeList(filters);
  const { data: requestData } = useRequests();

  // Latest request per worker, so the register can show where each one stands.
  const latestByEmployee = new Map<string, { status: string }>();
  for (const r of requestData?.requests ?? []) {
    if (!latestByEmployee.has(r.employeeId)) latestByEmployee.set(r.employeeId, { status: r.status });
  }

  const employees = (data?.employees ?? []) as Row[];
  const total = data?.total ?? 0;
  const hasFilters = Boolean(debouncedSearch || site || active !== 'true');

  const clearFilters = () => {
    setSearch('');
    setSite('');
    setActive('true');
  };

  return (
    <>
      <PortalTopBar
        title="Workers"
        actions={
          <Button size="sm" iconStart={<Icon name="plus" size={15} />} onClick={() => setCreating(true)}>
            Register worker
          </Button>
        }
      />
      <PortalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 1180 }}>
          <Card padding="var(--space-5)">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
              <TextField
                label="Search"
                placeholder="Name, job title, site or worker number"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                iconStart={<Icon name="search" size={16} />}
              />
              <SelectField
                label="Site"
                placeholder="All sites"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                options={data?.sites ?? []}
              />
              <SelectField
                label="Status"
                value={active}
                onChange={(e) => setActive(e.target.value as 'true' | 'false' | 'all')}
                options={[
                  { value: 'true', label: 'Active only' },
                  { value: 'false', label: 'Archived only' },
                  { value: 'all', label: 'All workers' },
                ]}
              />
            </div>
            {hasFilters && (
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>Active filters</span>
                {debouncedSearch && <Tag onRemove={() => setSearch('')}>{`“${debouncedSearch}”`}</Tag>}
                {site && <Tag onRemove={() => setSite('')}>{site}</Tag>}
                {active !== 'true' && (
                  <Tag onRemove={() => setActive('true')}>
                    {active === 'false' ? 'Archived only' : 'All workers'}
                  </Tag>
                )}
              </div>
            )}
          </Card>

          {isError ? (
            <ErrorState
              message={error instanceof ApiError ? error.message : 'The worker register could not be loaded.'}
              onRetry={() => void refetch()}
            />
          ) : isPending ? (
            <LoadingState label="Loading workers…" />
          ) : employees.length === 0 && !hasFilters ? (
            <EmptyState
              title="No workers registered"
              body="Register your first worker to start requesting examinations and fitness certificates."
              action={
                <Button size="sm" onClick={() => setCreating(true)} iconStart={<Icon name="plus" size={15} />}>
                  Register worker
                </Button>
              }
            />
          ) : employees.length === 0 ? (
            <EmptyState
              title="No workers match these filters"
              body="Clear or widen the filters above to see the rest of the register."
              action={
                <Button size="sm" variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div style={{ overflowX: 'auto', opacity: isPlaceholderData ? 0.6 : 1 }}>
              <DataTable<Row>
                caption={`Worker register — ${total} record${total === 1 ? '' : 's'}`}
                onRowClick={(r) => navigate(`/portal/workers/${r.id}`)}
                columns={[
                  { key: 'fullName', header: 'Name' },
                  { key: 'role', header: 'Job title', render: (r) => r.role ?? '—' },
                  { key: 'site', header: 'Site', render: (r) => r.site ?? '—' },
                  {
                    key: 'active',
                    header: 'Record',
                    render: (r) =>
                      r.active ? (
                        <Badge tone="success" dot>Active</Badge>
                      ) : (
                        <Badge tone="neutral" dot>Archived</Badge>
                      ),
                  },
                  {
                    key: 'status',
                    header: 'Latest request',
                    render: (r) => {
                      const latest = latestByEmployee.get(r.id);
                      return latest ? (
                        <Badge tone={statusTone(latest.status as never)} dot>
                          {statusLabel(latest.status as never)}
                        </Badge>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>None</span>
                      );
                    },
                  },
                ]}
                rows={employees}
              />
            </div>
          )}
        </div>
      </PortalBody>

      <EmployeeFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={(employee) => navigate(`/portal/workers/${employee.id}`)}
      />
    </>
  );
}
