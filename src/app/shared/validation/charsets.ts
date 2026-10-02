/**
 * Conjuntos de caracteres aceitos pelos campos de texto.
 * `\p{L}` = qualquer letra (inclui acentos: "José", "Conceição"), `\p{M}` = acentos combinados,
 * `\p{N}` = qualquer dígito.
 */
export type TextCharset = 'any' | 'letters' | 'alphanumeric' | 'digits';

interface CharsetRule {
  /** Remove o que não pertence ao conjunto (usado durante a digitação). */
  readonly reject: RegExp;
  /** Valor completo válido (usado pelo validador). */
  readonly accept: RegExp;
}

export const CHARSETS: Readonly<Record<Exclude<TextCharset, 'any'>, CharsetRule>> = {
  /** Nomes de pessoas: letras, espaço, apóstrofo e hífen ("Ana D'Ávila-Souza"). */
  letters: { reject: /[^\p{L}\p{M}\s'-]/gu, accept: /^[\p{L}\p{M}\s'-]+$/u },
  /** Letras, dígitos e espaço. */
  alphanumeric: { reject: /[^\p{L}\p{M}\p{N}\s]/gu, accept: /^[\p{L}\p{M}\p{N}\s]+$/u },
  /** Somente 0-9 (códigos, matrículas). Para quantidades use o NumberField. */
  digits: { reject: /\D/g, accept: /^\d+$/ },
};

export function filterCharset(value: string, charset: TextCharset): string {
  return charset === 'any' ? value : value.replace(CHARSETS[charset].reject, '');
}
