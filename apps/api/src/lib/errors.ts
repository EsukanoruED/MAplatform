/**
 * Domain error types. Every one carries a machine-readable `code` and an
 * HTTP status, so `errorHandler` can turn it into the platform's single
 * `{ error: { code, message } }` response shape without leaking internals.
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, new.target);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'The request body failed validation.', details?: unknown) {
    super(400, 'VALIDATION_FAILED', message, details);
  }
}

/** Deliberately generic: never reveals whether the email or the password was wrong. */
export class InvalidCredentialsError extends AppError {
  constructor() {
    super(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = 'Authentication is required.') {
    super(401, 'UNAUTHENTICATED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have access to this resource.') {
    super(403, 'FORBIDDEN', message);
  }
}

/**
 * A company principal referenced a record that is not inside its own tenant.
 * Reported as 404 rather than 403 so the API does not confirm that an id exists
 * in some other company's data.
 */
export class ForbiddenTenantAccessError extends AppError {
  constructor(message = 'Resource not found.') {
    super(404, 'NOT_FOUND', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found.') {
    super(404, 'NOT_FOUND', message);
  }
}

export class InvalidStatusTransitionError extends AppError {
  constructor(from: string, to: string) {
    super(422, 'INVALID_STATUS_TRANSITION', `A request cannot move from ${from} to ${to}.`);
  }
}
