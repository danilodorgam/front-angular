export interface TranslationCatalog {
  readonly [key: string]: string | TranslationCatalog;
}

export type TranslationParams = Readonly<Record<string, unknown>>;
