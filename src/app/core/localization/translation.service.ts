import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { APP_ENVIRONMENT } from '../../../environments/environment.token';
import { readStorage, writeStorage } from '../../shared/utils/safe-storage';
import { isSupportedLanguage, SupportedLanguage } from './language';
import { TRANSLATION_LOADER } from './translation-loader';
import { TranslationCatalog, TranslationParams } from './translation.types';

const STORAGE_KEY = 'app.language';
const PLACEHOLDER = /\{\{\s*(\w+)\s*\}\}/g;

/**
 * Tradução em tempo de execução baseada em signals: trocar o idioma atualiza
 * imediatamente todos os templates que usam o pipe `translate`.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly env = inject(APP_ENVIRONMENT);
  private readonly loader = inject(TRANSLATION_LOADER);
  private readonly document = inject(DOCUMENT);

  private readonly cache = new Map<SupportedLanguage, TranslationCatalog>();
  private readonly catalog = signal<TranslationCatalog>({});
  private readonly currentLanguage = signal<SupportedLanguage>(this.env.i18n.defaultLanguage);

  readonly language = this.currentLanguage.asReadonly();
  readonly supportedLanguages = this.env.i18n.supportedLanguages;

  /** Carrega o idioma salvo pelo usuário, o do navegador ou o padrão do ambiente. */
  init(): Promise<void> {
    return this.use(this.resolveInitialLanguage());
  }

  async use(language: SupportedLanguage): Promise<void> {
    let catalog = this.cache.get(language);
    if (!catalog) {
      catalog = await this.loader(language);
      this.cache.set(language, catalog);
    }
    this.catalog.set(catalog);
    this.currentLanguage.set(language);
    // e-MAG 3.1: identificar o idioma principal da página.
    this.document.documentElement.lang = language;
    writeStorage(STORAGE_KEY, language);
  }

  /** Retorna o texto da chave (ex.: `estoque.list.title`) ou a própria chave quando ausente. */
  translate(key: string, params?: TranslationParams): string {
    const value = resolvePath(this.catalog(), key);
    if (typeof value !== 'string') {
      return key;
    }
    return params ? interpolate(value, params) : value;
  }

  private resolveInitialLanguage(): SupportedLanguage {
    const candidates = [readStorage(STORAGE_KEY), this.document.defaultView?.navigator.language];
    const match = candidates.find(
      (lang): lang is SupportedLanguage =>
        isSupportedLanguage(lang) && this.supportedLanguages.includes(lang),
    );
    return match ?? this.env.i18n.defaultLanguage;
  }
}

function resolvePath(catalog: TranslationCatalog, key: string): string | TranslationCatalog | undefined {
  return key
    .split('.')
    .reduce<string | TranslationCatalog | undefined>(
      (node, segment) => (node && typeof node === 'object' ? node[segment] : undefined),
      catalog,
    );
}

function interpolate(template: string, params: TranslationParams): string {
  return template.replace(PLACEHOLDER, (match, name: string) => {
    const value = params[name];
    return value === undefined || value === null ? match : String(value);
  });
}
