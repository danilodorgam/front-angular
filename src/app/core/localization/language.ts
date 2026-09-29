export const SUPPORTED_LANGUAGES = ['pt-BR', 'en'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Nome de cada idioma escrito no próprio idioma (não é traduzido). */
export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  'pt-BR': 'Português (Brasil)',
  en: 'English',
};

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}
