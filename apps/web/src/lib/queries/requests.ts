import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { CreateRequestPayload, RequestStatus, RequestType } from '../api';

export type RequestFilters = {
  status?: RequestStatus;
  type?: RequestType;
  employeeId?: string;
  search?: string;
};

export const requestKeys = {
  all: ['requests'] as const,
  list: (filters?: RequestFilters) => [...requestKeys.all, 'list', filters ?? {}] as const,
  detail: (id: string) => [...requestKeys.all, 'detail', id] as const,
};

/**
 * The tenant's requests. No companyId is passed — the server reads it from the
 * session, so this hook cannot be pointed at another company's data.
 */
export function useRequests(filters?: RequestFilters) {
  return useQuery({
    queryKey: requestKeys.list(filters),
    queryFn: () => api.listRequests(filters),
    placeholderData: (previous) => previous,
  });
}

export function useRequest(id: string | undefined) {
  return useQuery({
    queryKey: requestKeys.detail(id ?? ''),
    queryFn: () => api.getRequest(id as string),
    enabled: Boolean(id),
  });
}

/**
 * The employee picker used by the request form. The richer roster hooks (search,
 * filters, detail, mutations) live in queries/employees.ts.
 */
export function useEmployees() {
  return useQuery({
    queryKey: ['employees', 'list', {}] as const,
    queryFn: () => api.listEmployees(),
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRequestPayload) => api.createRequest(payload),
    onSuccess: () => {
      // The dashboard's stat tiles and the certificate register both read this
      // list, so one invalidation refreshes every screen showing request data.
      void queryClient.invalidateQueries({ queryKey: requestKeys.all });
    },
  });
}
