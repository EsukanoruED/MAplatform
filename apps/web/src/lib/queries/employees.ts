import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { EmployeeWritePayload } from '../api';
import { requestKeys } from './requests';

export type EmployeeFilters = {
  search?: string;
  site?: string;
  active?: 'true' | 'false' | 'all';
};

export const employeeKeys = {
  all: ['employees'] as const,
  list: (filters?: EmployeeFilters) => [...employeeKeys.all, 'list', filters ?? {}] as const,
  detail: (id: string) => [...employeeKeys.all, 'detail', id] as const,
};

/**
 * The tenant's roster. No companyId is passed — the server reads it from the
 * session, so this hook cannot be pointed at another company's employees.
 */
export function useEmployeeList(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => api.listEmployees(filters),
    // Keeps the previous page on screen while a new search runs, so the table
    // does not flash back to a loading state on every keystroke.
    placeholderData: (previous) => previous,
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? ''),
    queryFn: () => api.getEmployee(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmployeeWritePayload) => api.createEmployee(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<EmployeeWritePayload> & { active?: boolean }) =>
      api.updateEmployee(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      // A renamed or archived worker shows up on request lists too.
      void queryClient.invalidateQueries({ queryKey: requestKeys.all });
    },
  });
}
