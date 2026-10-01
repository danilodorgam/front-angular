import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

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
  /** Máximo de casas decimais (só faz sentido com `allowDecimal`). */
  readonly decimalPlaces?: number;
}

/**
 * Valida o formato numérico. O sinal e os limites ficam com `Validators.min`/`Validators.max`.
 * Erros: `{ numeric: { allowDecimal } }` ou `{ decimalPlaces: { max, actual } }`.
 */
function numeric(options: NumericOptions = {}): ValidatorFn {
  const allowDecimal = options.allowDecimal ?? false;
  const maxDecimals = options.decimalPlaces;
  return (control: AbstractControl): ValidationErrors | null => {
    const { value } = control;
    if (isEmpty(value)) {
      return null;
    }
    const valid =
      typeof value === 'number'
        ? Number.isFinite(value) && (allowDecimal || Number.isInteger(value))
        : (allowDecimal ? DECIMAL_PATTERN : INTEGER_PATTERN).test(String(value));
    if (!valid) {
      return { numeric: { allowDecimal } };
    }
    if (allowDecimal && maxDecimals !== undefined) {
      const actual = countDecimals(value as number | string);
      if (actual > maxDecimals) {
        return { decimalPlaces: { max: maxDecimals, actual } };
      }
    }
    return null;
  };
}

function countDecimals(value: number | string): number {
  const text = typeof value === 'number' ? String(value) : value.replace(',', '.');
  const [, decimals = ''] = text.split('.');
  return decimals.length;
}

/**
 * Igual ao `Validators.pattern`, mas com mensagem própria em vez do genérico "formato inválido".
 * Ex.: `AppValidators.pattern(/^[A-Z0-9-]+$/, 'estoque.validation.sku')`.
 * A mensagem recebe `{{field}}` como as demais.
 */
function pattern(regex: RegExp | string, messageKey: string): ValidatorFn {
  const validator = Validators.pattern(regex);
  return (control: AbstractControl): ValidationErrors | null => {
    const errors = validator(control);
    return errors ? { pattern: { ...errors['pattern'], messageKey } } : null;
  };
}

/** Validadores reutilizáveis, sem regra de negócio. Use junto com os do Angular. */
export const AppValidators = { notBlank, email, numeric, pattern } as const;
