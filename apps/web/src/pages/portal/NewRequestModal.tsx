import React from 'react';
import { Alert, Button, Icon, Modal, SelectField, TextField } from '../../components';
import { ApiError } from '../../lib/api';
import type { RequestType } from '../../lib/api';
import { useCreateRequest, useEmployees } from '../../lib/queries/requests';

/**
 * Files a real request via POST /api/requests.
 *
 * The employee picker is populated from GET /api/employees, which the server
 * scopes to the signed-in company — so the list cannot contain another tenant's
 * worker. No companyId is sent: the server takes it from the session.
 */
export function NewRequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: employeeData, isPending: employeesPending } = useEmployees();
  const createRequest = useCreateRequest();

  const [employeeId, setEmployeeId] = React.useState('');
  const [type, setType] = React.useState<RequestType>('FITNESS_CERTIFICATE');
  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const employees = employeeData?.employees ?? [];

  // Reset the form each time the modal is opened.
  React.useEffect(() => {
    if (open) {
      setEmployeeId('');
      setType('FITNESS_CERTIFICATE');
      setNotes('');
      setError(null);
    }
  }, [open]);

  const submit = async () => {
    setError(null);
    if (!employeeId) {
      setError('Choose the worker this examination is for.');
      return;
    }
    try {
      await createRequest.mutateAsync({
        employeeId,
        type,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'The request could not be submitted.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={480}
      title="New examination request"
      description="The request is filed against your company and enters the queue as Submitted."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createRequest.isPending}>Cancel</Button>
          <Button onClick={() => void submit()} disabled={createRequest.isPending}>
            {createRequest.isPending ? 'Submitting…' : 'Submit request'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
          options={employees.map((e) => ({
            value: e.id,
            label: e.site ? `${e.fullName} — ${e.site}` : e.fullName,
          }))}
          hint={!employeesPending && employees.length === 0 ? 'No workers are registered for your company yet.' : undefined}
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
        <TextField
          label="Notes"
          multiline
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Reason for referral, restrictions to consider, review interval"
          hint="Optional. Avoid recording clinical findings here."
        />
      </div>
    </Modal>
  );
}
