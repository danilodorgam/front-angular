let counter = 0;

/** Gera ids únicos para associar label, dica e mensagem de erro ao campo. */
export function uniqueId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}
