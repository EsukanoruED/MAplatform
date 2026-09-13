import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { CreateRequestPayload, RequestStatus, RequestType } from '../api';

export const requestKeys = {
  all: ['requests'] as const,
  list: (filters?: { status?: RequestStatus; type?: RequestType }) =>
    [...requestKeys.all, 'list', filters ?? {}] as const,
  detail: (id: string) => [...requestKeys.all, 'detail', id] as const,
};

export const employeeKeys = {
  all: ['employees'] as const,
};

/**
 * The tenant's requests. No companyId is passed — the server reads it from the
 * session, so this hook cannot be pointed at another company's data.
 */
export function useRequests(filters?: { status?: RequestStatus; type?: RequestType }) {
  return useQuery({
    queryKey: requestKeys.list(filters),
    queryFn: () => api.listRequests(filters),
  });
}

export function useRequest(id: string | undefined) {
  return useQuery({
    queryKey: requestKeys.detail(id ?? ''),
    queryFn: () => api.getRequest(id as string),
    enabled: Boolean(id),
  });
}

export function useEmployees() {
  return useQuery({
    queryKey: employeeKeys.all,
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
