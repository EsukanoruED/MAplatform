import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { PaymentStatus, RequestStatus, RequestType } from '../api';
import { requestKeys } from './requests';

export const labKeys = {
  all: ['labs'] as const,
  detail: (id: string) => [...labKeys.all, 'detail', id] as const,
};

export const paymentKeys = {
  all: ['payments'] as const,
  list: (filters?: { status?: PaymentStatus; requestId?: string }) =>
    [...paymentKeys.all, 'list', filters ?? {}] as const,
};

export const dashboardKeys = {
  company: ['dashboard', 'company'] as const,
  admin: ['dashboard', 'admin'] as const,
};

export const adminKeys = {
  all: ['admin'] as const,
  requests: (filters?: { status?: RequestStatus; type?: RequestType; companyId?: string }) =>
    [...adminKeys.all, 'requests', filters ?? {}] as const,
  request: (id: string) => [...adminKeys.all, 'request', id] as const,
  companies: [...['admin'], 'companies'] as const,
};

/** Active laboratories, for the request form's picker. */
export function useLabs() {
  return useQuery({ queryKey: labKeys.all, queryFn: () => api.listLabs() });
}

export function useCompanyDashboard() {
  return useQuery({ queryKey: dashboardKeys.company, queryFn: () => api.getCompanyDashboard() });
}

export function usePayments(filters?: { status?: PaymentStatus; requestId?: string }) {
  return useQuery({
    queryKey: paymentKeys.list(filters),
    queryFn: () => api.listPayments(filters),
  });
}

export function useRequestDocuments(requestId: string | undefined) {
  return useQuery({
    queryKey: [...requestKeys.detail(requestId ?? ''), 'documents'],
    queryFn: () => api.listRequestDocuments(requestId as string),
    enabled: Boolean(requestId),
  });
}

/**
 * Everything a status change touches gets invalidated together: the request
 * itself, the list it appears in, the dashboard aggregates and the ledger.
 */
function invalidateWorkflow(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: requestKeys.all });
  void queryClient.invalidateQueries({ queryKey: dashboardKeys.company });
  void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
  void queryClient.invalidateQueries({ queryKey: adminKeys.all });
}

/** Company-side transition — in practice, withdrawing a request. */
export function useTransitionRequest(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { status: RequestStatus; note?: string; assignedLabId?: string }) =>
      api.transitionRequest(id, payload),
    onSuccess: () => invalidateWorkflow(queryClient),
  });
}

export function useUploadRequestDocument(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => api.uploadRequestDocument(requestId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: requestKeys.all });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.company });
    },
  });
}

// ----------------------------------------------------------- admin console

export function useAdminRequests(filters?: {
  status?: RequestStatus;
  type?: RequestType;
  companyId?: string;
}) {
  return useQuery({
    queryKey: adminKeys.requests(filters),
    queryFn: () => api.adminListRequests(filters),
    placeholderData: (previous) => previous,
  });
}

export function useAdminRequest(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.request(id ?? ''),
    queryFn: () => api.adminGetRequest(id as string),
    enabled: Boolean(id),
  });
}

export function useAdminTransitionRequest(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { status: RequestStatus; note?: string; assignedLabId?: string }) =>
      api.adminTransitionRequest(id, payload),
    onSuccess: () => invalidateWorkflow(queryClient),
  });
}

export function useAdminAssignLab(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labId: string) => api.adminAssignLab(id, labId),
    onSuccess: () => invalidateWorkflow(queryClient),
  });
}

export function useAdminDashboard() {
  return useQuery({ queryKey: dashboardKeys.admin, queryFn: () => api.adminGetDashboard() });
}

export const certificateKeys = {
  all: ['certificates'] as const,
};

/** The certificate register — issued certificates plus in-flight requests. */
export function useCertificates() {
  return useQuery({ queryKey: certificateKeys.all, queryFn: () => api.listCertificates() });
}
