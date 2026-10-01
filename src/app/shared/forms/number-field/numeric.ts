/** Mantém apenas dígitos e, se permitido, um único separador decimal (vírgula ou ponto). */
export function sanitizeNumeric(raw: string, allowDecimal: boolean): string {
  let result = '';
  let hasSeparator = false;
  for (const char of raw) {
    if (char >= '0' && char <= '9') {
      result += char;
    } else if (allowDecimal && !hasSeparator && (char === ',' || char === '.')) {
      result += char;
      hasSeparator = true;
    }
  }
  return result;
}

/** Converte o texto digitado ("12,5" ou "12.5") em número; vazio vira null. */
export function parseNumeric(text: string): number | null {
  const normalized = text.replace(',', '.');
  if (normalized === '' || normalized === '.') {
    return null;
  }
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/** Exibe o número com o separador decimal do idioma atual. */
export function formatNumeric(value: number | null | undefined, decimalSeparator: string): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '';
  }
  return String(value).replace('.', decimalSeparator);
}

export function decimalSeparatorFor(locale: string): string {
  return (
    new Intl.NumberFormat(locale).formatToParts(1.1).find((part) => part.type === 'decimal')
      ?.value ?? ','
  );
}
