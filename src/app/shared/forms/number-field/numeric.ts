export interface NumericInputOptions {
  /** Aceita um separador decimal (vírgula ou ponto). Padrão: false. */
  readonly allowDecimal?: boolean;
  /** Aceita o sinal de menos no início. Padrão: false. */
  readonly allowNegative?: boolean;
  /** Máximo de casas decimais (ex.: 2 para valores monetários). Padrão: sem limite. */
  readonly decimalPlaces?: number | null;
}

/**
 * Mantém apenas o que pode compor um número válido:
 * dígitos, o sinal de menos no início (se permitido) e um único separador decimal (se permitido),
 * respeitando o limite de casas decimais.
 */
export function sanitizeNumeric(raw: string, options: NumericInputOptions = {}): string {
  const { allowDecimal = false, allowNegative = false, decimalPlaces = null } = options;
  let result = '';
  let hasSeparator = false;
  let decimals = 0;
  for (const char of raw) {
    if (char >= '0' && char <= '9') {
      if (hasSeparator && decimalPlaces !== null && decimals >= decimalPlaces) {
        continue;
      }
      result += char;
      if (hasSeparator) {
        decimals++;
      }
    } else if (char === '-' && allowNegative && result === '') {
      result = '-';
    } else if (
      (char === ',' || char === '.') &&
      allowDecimal &&
      !hasSeparator &&
      decimalPlaces !== 0
    ) {
      result += char;
      hasSeparator = true;
    }
  }
  return result;
}

/** Converte o texto digitado ("12,5", "12.5" ou "-3") em número; vazio ou incompleto vira null. */
export function parseNumeric(text: string): number | null {
  const normalized = text.replace(',', '.');
  if (normalized === '' || normalized === '.' || normalized === '-' || normalized === '-.') {
    return null;
  }
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/**
 * Exibe o número com o separador decimal do idioma atual.
 * Com `decimalPlaces`, fixa a quantidade de casas (ex.: 12.5 → "12,50").
 */
export function formatNumeric(
  value: number | null | undefined,
  decimalSeparator: string,
  decimalPlaces: number | null = null,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '';
  }
  const text = decimalPlaces === null ? String(value) : value.toFixed(decimalPlaces);
  return text.replace('.', decimalSeparator);
}

export function decimalSeparatorFor(locale: string): string {
  return (
    new Intl.NumberFormat(locale).formatToParts(1.1).find((part) => part.type === 'decimal')
      ?.value ?? ','
  );
}
