import { InjectionToken } from '@angular/core';
import { SupportedLanguage } from './language';
import { TranslationCatalog } from './translation.types';

export type TranslationLoader = (language: SupportedLanguage) => Promise<TranslationCatalog>;

/**
 * Cada idioma vira um chunk separado (import dinâmico): o usuário só baixa o catálogo
 * do idioma que está usando.
 */
const BUNDLED_CATALOGS: Record<SupportedLanguage, () => Promise<TranslationCatalog>> = {
  'pt-BR': () => import('../../../i18n/pt-BR').then((m) => m.default),
  en: () => import('../../../i18n/en').then((m) => m.default),
};

export const loadBundledCatalog: TranslationLoader = (language) => BUNDLED_CATALOGS[language]();

/**
 * Ponto de extensão: para carregar traduções de um servidor (ex.: CMS), basta prover
 * outra implementação deste token.
 */
export const TRANSLATION_LOADER = new InjectionToken<TranslationLoader>('TRANSLATION_LOADER', {
  providedIn: 'root',
  factory: () => loadBundledCatalog,
});
