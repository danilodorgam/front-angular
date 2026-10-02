import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores de documentos e formatos brasileiros.
 * Aceitam o valor com ou sem máscara ("529.982.247-25" ou "52998224725").
 * Campo vazio é válido (obrigatoriedade é responsabilidade do `Validators.required`).
 * Erros: `{ cpf: true }`, `{ cnpj: true }`, `{ cep: true }`, `{ phone: true }`, `{ date: true }`;
 * as mensagens seguem a convenção `validation.<erro>`.
 */

function digitsOf(value: string): string {
  return value.replace(/\D/g, '');
}

/** Todos os caracteres iguais ("111.111.111-11") passam no cálculo, mas não são documentos válidos. */
function allSame(value: string): boolean {
  return /^(.)\1*$/.test(value);
}

function cpfCheckDigit(base: string): number {
  const weightStart = base.length + 1;
  const sum = [...base].reduce((acc, char, i) => acc + Number(char) * (weightStart - i), 0);
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

export function isValidCpf(value: string): boolean {
  if (!/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(value)) {
    return false;
  }
  const cpf = digitsOf(value);
  if (allSame(cpf)) {
    return false;
  }
  const first = cpfCheckDigit(cpf.slice(0, 9));
  const second = cpfCheckDigit(cpf.slice(0, 9) + first);
  return cpf.endsWith(`${first}${second}`);
}

const CNPJ_FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_SECOND_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

/** No CNPJ alfanumérico, cada caractere vale (código ASCII − 48): '0'..'9' → 0..9, 'A' → 17... */
function cnpjCheckDigit(base: string, weights: readonly number[]): number {
  const sum = [...base].reduce((acc, char, i) => acc + (char.charCodeAt(0) - 48) * weights[i], 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

/**
 * Aceita o CNPJ numérico e o alfanumérico (emitido a partir de julho/2026):
 * 12 caracteres [A-Z0-9] + 2 dígitos verificadores numéricos.
 */
export function isValidCnpj(value: string): boolean {
  if (!/^[A-Za-z0-9]{2}\.?[A-Za-z0-9]{3}\.?[A-Za-z0-9]{3}\/?[A-Za-z0-9]{4}-?\d{2}$/.test(value)) {
    return false;
  }
  const cnpj = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (allSame(cnpj)) {
    return false;
  }
  const base = cnpj.slice(0, 12);
  const first = cnpjCheckDigit(base, CNPJ_FIRST_WEIGHTS);
  const second = cnpjCheckDigit(base + first, CNPJ_SECOND_WEIGHTS);
  return cnpj.endsWith(`${first}${second}`);
}

/** 8 dígitos, com ou sem o hífen ("70040-010" ou "70040010"). */
export function isValidCep(value: string): boolean {
  return /^\d{5}-?\d{3}$/.test(value);
}

/**
 * Telefone com DDD: fixo com 10 dígitos (número começa com 2 a 5)
 * ou celular com 11 dígitos (número começa com 9).
 * Aceita parênteses, espaço e hífen: "(61) 91234-5678".
 */
export function isValidPhone(value: string): boolean {
  if (/[^\d\s()-]/.test(value)) {
    return false;
  }
  const phone = digitsOf(value);
  return /^[1-9]{2}[2-5]\d{7}$/.test(phone) || /^[1-9]{2}9\d{8}$/.test(phone);
}

/** Data real no formato dd/mm/aaaa (com ou sem as barras). */
export function isValidDate(value: string): boolean {
  const match = /^(\d{2})\/?(\d{2})\/?(\d{4})$/.exec(value);
  if (!match) {
    return false;
  }
  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  return (
    year >= 1000 &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function check(errorKey: string, isValid: (value: string) => boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const { value } = control;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return isValid(String(value)) ? null : { [errorKey]: true };
  };
}

export const BrValidators = {
  cpf: check('cpf', isValidCpf),
  cnpj: check('cnpj', isValidCnpj),
  cep: check('cep', isValidCep),
  phone: check('phone', isValidPhone),
  date: check('date', isValidDate),
} as const;
