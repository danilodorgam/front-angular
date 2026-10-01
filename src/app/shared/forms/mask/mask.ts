/**
 * Máscaras de digitação. No padrão, `#` aceita um dígito e `*` aceita letra ou dígito
 * (letras viram maiúsculas). Os demais caracteres são fixos e inseridos automaticamente.
 *
 * Uma lista de padrões escolhe o primeiro que comporta o que foi digitado
 * (ex.: telefone fixo com 10 dígitos e celular com 11).
 */
export type MaskPattern = string | readonly string[];

export const MASKS = {
  cpf: '###.###.###-##',
  /** Aceita o CNPJ alfanumérico (a partir de julho/2026); os 2 últimos são sempre dígitos. */
  cnpj: '**.***.***/****-##',
  cep: '#####-###',
  phone: ['(##) ####-####', '(##) #####-####'],
  date: '##/##/####',
} as const satisfies Record<string, MaskPattern>;

const SLOTS: Readonly<Record<string, RegExp>> = { '#': /[0-9]/, '*': /[A-Z0-9]/ };

/** Letras e dígitos digitados, em maiúsculas: é o que preenche os marcadores. */
export function unmask(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function slotCount(pattern: string): number {
  return [...pattern].filter((char) => char in SLOTS).length;
}

function pickPattern(mask: MaskPattern, length: number): string {
  if (typeof mask === 'string') {
    return mask;
  }
  const bySize = [...mask].sort((a, b) => slotCount(a) - slotCount(b));
  return bySize.find((pattern) => slotCount(pattern) >= length) ?? bySize[bySize.length - 1];
}

/** Maior comprimento possível do texto mascarado (usado como `maxlength`). */
export function maskMaxLength(mask: MaskPattern): number {
  return Math.max(...(typeof mask === 'string' ? [mask] : mask).map((pattern) => pattern.length));
}

/** A máscara aceita letras? (define o teclado do celular) */
export function maskAcceptsLetters(mask: MaskPattern): boolean {
  return (typeof mask === 'string' ? [mask] : mask).some((pattern) => pattern.includes('*'));
}

/** Aplica a máscara ao texto digitado. Caracteres que não cabem no marcador são descartados. */
export function applyMask(raw: string, mask: MaskPattern): string {
  const chars = unmask(raw);
  const pattern = pickPattern(mask, chars.length);
  let result = '';
  let filled = 0;
  let index = 0;
  for (const char of pattern) {
    if (index >= chars.length) {
      break;
    }
    const slot = SLOTS[char];
    if (!slot) {
      result += char;
      continue;
    }
    while (index < chars.length && !slot.test(chars[index])) {
      index++;
    }
    if (index >= chars.length) {
      break;
    }
    result += chars[index++];
    filled = result.length;
  }
  // Não termina com um separador solto ("123." → "123").
  return result.slice(0, filled);
}

/** Posição do cursor no texto mascarado logo após o n-ésimo caractere digitado. */
export function caretAfter(masked: string, typedCount: number): number {
  if (typedCount <= 0) {
    return 0;
  }
  let count = 0;
  for (let i = 0; i < masked.length; i++) {
    if (/[A-Za-z0-9]/.test(masked[i]) && ++count === typedCount) {
      return i + 1;
    }
  }
  return masked.length;
}
