import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Mais restritivo que `Validators.email` do Angular, que aceita "a@b" (sem domínio).
 * Exige usuário, "@", domínio e extensão com pelo menos duas letras.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/;
const INTEGER_PATTERN = /^-?\d+$/;
const DECIMAL_PATTERN = /^-?\d+([.,]\d+)?$/;

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

/** Rejeita valores compostos apenas por espaços (complementa `Validators.required`). */
function notBlank(control: AbstractControl): ValidationErrors | null {
  const { value } = control;
  return typeof value === 'string' && value.length > 0 && value.trim().length === 0
    ? { notBlank: true }
    : null;
}

function email(control: AbstractControl): ValidationErrors | null {
  const { value } = control;
  if (isEmpty(value)) {
    return null;
  }
  return typeof value === 'string' && EMAIL_PATTERN.test(value) ? null : { email: true };
}

export interface NumericOptions {
  readonly allowDecimal?: boolean;
}

function numeric(options: NumericOptions = {}): ValidatorFn {
  const allowDecimal = options.allowDecimal ?? false;
  return (control: AbstractControl): ValidationErrors | null => {
    const { value } = control;
    if (isEmpty(value)) {
      return null;
    }
    const valid =
      typeof value === 'number'
        ? Number.isFinite(value) && (allowDecimal || Number.isInteger(value))
        : (allowDecimal ? DECIMAL_PATTERN : INTEGER_PATTERN).test(String(value));
    return valid ? null : { numeric: { allowDecimal } };
  };
}

/** Validadores reutilizáveis, sem regra de negócio. Use junto com os do Angular. */
export const AppValidators = { notBlank, email, numeric } as const;
