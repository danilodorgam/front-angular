import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { AppError, AppErrorKind, isAppError } from './app-error';

const MESSAGE_KEYS: Record<AppErrorKind, string> = {
  network: 'errors.network',
  timeout: 'errors.timeout',
  'bad-request': 'errors.badRequest',
  unauthorized: 'errors.unauthorized',
  forbidden: 'errors.forbidden',
  'not-found': 'errors.notFound',
  conflict: 'errors.conflict',
  validation: 'errors.validation',
  server: 'errors.server',
  unavailable: 'errors.unavailable',
  unknown: 'errors.unexpected',
};

/** Converte qualquer falha de requisição em um {@link AppError}. */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }
  if (error instanceof TimeoutError) {
    return build('timeout', null, error);
  }
  if (error instanceof HttpErrorResponse) {
    return build(
      kindFromStatus(error.status),
      error.status,
      error,
      extractFieldErrors(error.error),
    );
  }
  return build('unknown', null, error);
}

export function kindFromStatus(status: number): AppErrorKind {
  switch (status) {
    case 0:
      return 'network';
    case 400:
      return 'bad-request';
    case 401:
      return 'unauthorized';
    case 403:
      return 'forbidden';
    case 404:
      return 'not-found';
    case 408:
    case 504:
      return 'timeout';
    case 409:
      return 'conflict';
    case 422:
      return 'validation';
    case 502:
    case 503:
      return 'unavailable';
    default:
      return status >= 500 ? 'server' : 'unknown';
  }
}

/** Falhas transitórias em que vale a pena repetir um GET. */
export function isRetryable(error: unknown): boolean {
  return error instanceof HttpErrorResponse && [0, 502, 503, 504].includes(error.status);
}

function build(
  kind: AppErrorKind,
  status: number | null,
  cause: unknown,
  fieldErrors?: Record<string, string>,
): AppError {
  return {
    kind,
    status,
    messageKey: MESSAGE_KEYS[kind],
    cause,
    ...(fieldErrors && { fieldErrors }),
  };
}

function extractFieldErrors(body: unknown): Record<string, string> | undefined {
  if (typeof body !== 'object' || body === null || !('errors' in body)) {
    return undefined;
  }
  const errors = (body as { errors: unknown }).errors;
  if (typeof errors !== 'object' || errors === null) {
    return undefined;
  }
  const entries = Object.entries(errors).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  );
  return entries.length ? Object.fromEntries(entries) : undefined;
}
