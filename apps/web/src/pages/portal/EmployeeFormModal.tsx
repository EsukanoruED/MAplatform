import React from 'react';
import { Alert, Button, Icon, Modal, TextField } from '../../components';
import { ApiError } from '../../lib/api';
import type { EmployeeDetail } from '../../lib/api';
import { useCreateEmployee, useUpdateEmployee } from '../../lib/queries/employees';

/**
 * Create / edit form for a worker record.
 *
 * Validation is mirrored, not duplicated as the source of truth: the same rules
 * are enforced by zod on the server, and any field-level detail the server
 * returns is mapped back onto the matching input — so a rule that only exists
 * server-side (the per-company unique national ID, for instance) still lands on
 * the right field rather than in a generic banner.
 */
type FieldErrors = Partial<Record<'fullName' | 'nationalId' | 'role' | 'site' | 'dateOfBirth', string>>;

function validate(values: {
  fullName: string;
  nationalId: string;
  dateOfBirth: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (values.fullName.trim().length < 2) {
    errors.fullName = 'Enter the employee’s full name.';
  }
  if (values.nationalId.trim().length < 3) {
    errors.nationalId = 'Enter a national ID or worker number.';
  } else if (!/^[A-Za-z0-9][A-Za-z0-9\- /]*$/.test(values.nationalId.trim())) {
    errors.nationalId = 'Use letters, digits, spaces, hyphens or slashes only.';
  }
  if (values.dateOfBirth) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.dateOfBirth)) {
      errors.dateOfBirth = 'Use the format YYYY-MM-DD.';
    } else if (new Date(`${values.dateOfBirth}T00:00:00Z`) >= new Date()) {
      errors.dateOfBirth = 'Date of birth cannot be in the future.';
    }
  }

  return errors;
}

export function EmployeeFormModal({
  open,
  onClose,
  employee,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  /** Present when editing; omitted when registering a new worker. */
  employee?: EmployeeDetail;
  onSaved?: (employee: EmployeeDetail) => void;
}) {
  const isEdit = Boolean(employee);
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee(employee?.id ?? '');
  const pending = createEmployee.isPending || updateEmployee.isPending;

  const [fullName, setFullName] = React.useState('');
  const [nationalId, setNationalId] = React.useState('');
  const [role, setRole] = React.useState('');
  const [site, setSite] = React.useState('');
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  // Reset each time the modal opens, seeded from the record when editing.
  React.useEffect(() => {
    if (!open) return;
    setFullName(employee?.fullName ?? '');
    setNationalId(employee?.nationalId ?? '');
    setRole(employee?.role ?? '');
    setSite(employee?.site ?? '');
    setDateOfBirth(employee?.dateOfBirth ? employee.dateOfBirth.slice(0, 10) : '');
    setFieldErrors({});
    setFormError(null);
  }, [open, employee]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const errors = validate({ fullName, nationalId, dateOfBirth });
    setFieldErrors(errors);
    setFormError(null);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      fullName: fullName.trim(),
      nationalId: nationalId.trim(),
      role: role.trim() || null,
      site: site.trim() || null,
      dateOfBirth: dateOfBirth || null,
    };

    try {
      const result = isEdit
        ? await updateEmployee.mutateAsync(payload)
        : await createEmployee.mutateAsync(payload);
      onSaved?.(result.employee);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        // Map server-side field errors back onto the inputs.
        const details = Array.isArray(err.details) ? err.details : [];
        const mapped: FieldErrors = {};
        for (const detail of details as Array<{ path?: string; message?: string }>) {
          if (detail.path && detail.message) {
            mapped[detail.path as keyof FieldErrors] = detail.message;
          }
        }
        setFieldErrors(mapped);
        // Only show the banner when nothing landed on a specific field.
        if (Object.keys(mapped).length === 0) setFormError(err.message);
      } else {
        setFormError('The employee could not be saved.');
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={520}
      title={isEdit ? 'Edit worker' : 'Register a worker'}
      description={
        isEdit
          ? 'Changes apply to this worker’s record across the portal.'
          : 'The worker is registered against your company and becomes available for examination requests.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="employee-form" disabled={pending}>
            {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Register worker'}
          </Button>
        </>
      }
    >
      <form
        id="employee-form"
        onSubmit={submit}
        noValidate
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >
        {formError && (
          <Alert tone="danger" title="Could not save" icon={<Icon name="triangle-alert" size={18} />}>
            {formError}
          </Alert>
        )}

        <TextField
          label="Full name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={fieldErrors.fullName}
          autoComplete="off"
        />
        <TextField
          label="National ID or worker number"
          required
          value={nationalId}
          onChange={(e) => setNationalId(e.target.value)}
          error={fieldErrors.nationalId}
          hint={fieldErrors.nationalId ? undefined : 'Unique within your company.'}
          autoComplete="off"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
          <TextField
            label="Job title"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            error={fieldErrors.role}
            placeholder="Process operator"
          />
          <TextField
            label="Site"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            error={fieldErrors.site}
            placeholder="Jazan Site 4"
          />
        </div>
        <TextField
          label="Date of birth"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          error={fieldErrors.dateOfBirth}
          hint={fieldErrors.dateOfBirth ? undefined : 'Optional.'}
        />
      </form>
    </Modal>
  );
}
