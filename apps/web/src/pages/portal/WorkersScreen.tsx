import { useNavigate } from 'react-router-dom';
import { Badge, Button, DataTable, Icon } from '../../components';
import { PortalBody, PortalTopBar } from '../../layouts/PortalLayout';
import { useEmployees, useRequests } from '../../lib/queries/requests';
import { ApiError } from '../../lib/api';
import type { Employee } from '../../lib/api';
import { statusLabel, statusTone } from '../../lib/format';
import { EmptyState, ErrorState, LoadingState } from './ui-states';

/**
 * The worker register.
 *
 * The prototype's sidebar had a "Workers" entry but routed it to the dashboard's
 * table. This is that list as its own route, reading GET /api/employees — which
 * the server scopes to the signed-in company — and joining each worker to the
 * status of their most recent request.
 */
type Row = Employee & Record<string, unknown>;

export function WorkersScreen() {
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useEmployees();
  const { data: requestData } = useRequests();

  const requestsByEmployee = new Map<string, { status: string }>();
  for (const r of requestData?.requests ?? []) {
    if (!requestsByEmployee.has(r.employeeId)) requestsByEmployee.set(r.employeeId, { status: r.status });
  }

  const employees = (data?.employees ?? []) as Row[];

  return (
    <>
      <PortalTopBar title="Workers" />
      <PortalBody>
        <div style={{ maxWidth: 1180 }}>
          {isError ? (
            <ErrorState
              message={error instanceof ApiError ? error.message : 'The worker register could not be loaded.'}
              onRetry={() => void refetch()}
            />
          ) : isPending ? (
            <LoadingState label="Loading workers…" />
          ) : employees.length === 0 ? (
            <EmptyState
              title="No workers registered"
              body="Your company has no worker records yet. Employee management arrives in Phase 2; until then records are created by Medical Alliance on your behalf."
              action={<Button size="sm" variant="secondary" onClick={() => navigate('/portal')} iconStart={<Icon name="arrow-left" size={15} />}>Back to dashboard</Button>}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <DataTable<Row>
                caption={`Worker register — ${employees.length} record${employees.length === 1 ? '' : 's'}`}
                onRowClick={(r) => navigate(`/portal/workers/${r.id}`)}
                columns={[
                  { key: 'fullName', header: 'Name' },
                  { key: 'role', header: 'Role', render: (r) => r.role ?? '—' },
                  { key: 'site', header: 'Site', render: (r) => r.site ?? '—' },
                  {
                    key: 'status',
                    header: 'Latest request',
                    render: (r) => {
                      const latest = requestsByEmployee.get(r.id);
                      return latest ? (
                        <Badge tone={statusTone(latest.status as never)} dot>{statusLabel(latest.status as never)}</Badge>
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
    </>
  );
}
