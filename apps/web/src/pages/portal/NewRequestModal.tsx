import React from 'react';
import { Alert, Button, Icon, Modal, SelectField, TextField } from '../../components';
import { ApiError } from '../../lib/api';
import type { MedicalRequest, RequestType } from '../../lib/api';
import { useCreateRequest, useEmployees } from '../../lib/queries/requests';
import { useLabs } from '../../lib/queries/workflow';

/**
 * Files a real request via POST /api/requests.
 *
 * Both pickers are populated from tenant-scoped or reference endpoints: the
 * worker list comes from GET /api/employees (the server scopes it to the signed-in
 * company, so it cannot contain another tenant's worker) and the laboratory list
 * from GET /api/labs, which returns only labs that are actually selectable.
 *
 * No companyId is sent — the server derives the tenant from the session and
 * rejects the field outright if a client tries to supply one.
 */
export function NewRequestModal({
  open,
  onClose,
  defaultEmployeeId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  defaultEmployeeId?: string;
  onCreated?: (request: MedicalRequest) => void;
}) {
  const { data: employeeData, isPending: employeesPending } = useEmployees();
  const { data: labData, isPending: labsPending } = useLabs();
  const createRequest = useCreateRequest();

  const [employeeId, setEmployeeId] = React.useState('');
  const [type, setType] = React.useState<RequestType>('FITNESS_CERTIFICATE');
  const [assignedLabId, setAssignedLabId] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [employeeError, setEmployeeError] = React.useState<string | null>(null);

  const employees = employeeData?.employees ?? [];
  const labs = labData?.labs ?? [];

  // Reset the form each time the modal is opened.
  React.useEffect(() => {
    if (!open) return;
    setEmployeeId(defaultEmployeeId ?? '');
    setType('FITNESS_CERTIFICATE');
    setAssignedLabId('');
    setNotes('');
    setError(null);
    setEmployeeError(null);
  }, [open, defaultEmployeeId]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createRequest.isPending) return;

    setError(null);
    setEmployeeError(null);
    if (!employeeId) {
      setEmployeeError('Choose the worker this examination is for.');
      return;
    }

    try {
      const result = await createRequest.mutateAsync({
        employeeId,
        type,
        ...(assignedLabId ? { assignedLabId } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      onCreated?.(result.request);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'The request could not be submitted.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={520}
      title="New examination request"
      description="The request is filed against your company and enters the queue as Submitted."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createRequest.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="new-request-form" disabled={createRequest.isPending}>
            {createRequest.isPending ? 'Submitting…' : 'Submit request'}
          </Button>
        </>
      }
    >
      <form
        id="new-request-form"
        onSubmit={submit}
        noValidate
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >
        {error && (
          <Alert tone="danger" title="Could not submit" icon={<Icon name="triangle-alert" size={18} />}>
            {error}
          </Alert>
        )}

        <SelectField
          label="Worker"
          required
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder={employeesPending ? 'Loading workers…' : 'Select a worker'}
          error={employeeError ?? undefined}
          options={employees
            .filter((e) => e.active)
            .map((e) => ({
              value: e.id,
              label: e.site ? `${e.fullName} — ${e.site}` : e.fullName,
            }))}
          hint={
            !employeesPending && employees.length === 0
              ? 'No workers are registered yet. Register one from the Workers screen first.'
              : undefined
          }
        />

        <SelectField
          label="Examination type"
          required
          value={type}
          onChange={(e) => setType(e.target.value as RequestType)}
          options={[
            { value: 'FITNESS_CERTIFICATE', label: 'Fitness certificate' },
            { value: 'CHECKUP', label: 'Checkup' },
          ]}
        />

        <SelectField
          label="Preferred laboratory"
          value={assignedLabId}
          onChange={(e) => setAssignedLabId(e.target.value)}
          placeholder={labsPending ? 'Loading laboratories…' : 'Medical Alliance will assign one'}
          options={labs.map((lab) => ({ value: lab.id, label: lab.name }))}
          hint="Optional. Only laboratories currently accepting work are listed."
        />

        <TextField
          label="Notes"
          multiline
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Reason for referral, restrictions to consider, review interval"
          hint="Optional. Avoid recording clinical findings here."
        />
      </form>
    </Modal>
  );
}
