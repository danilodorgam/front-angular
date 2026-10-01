import { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppEnvironment } from '@env/environment.model';
import { APP_ENVIRONMENT } from '@env/environment.token';
import { SupportedLanguage } from '@core/localization/language';
import { registerAppLocales } from '@core/localization/locales';
import { TranslationService } from '@core/localization/translation.service';

export const TEST_ENVIRONMENT: AppEnvironment = {
  name: 'development',
  production: false,
  appVersion: 'test',
  api: { baseUrl: 'http://api.test', timeoutMs: 5000, retryAttempts: 0 },
  i18n: { defaultLanguage: 'pt-BR', supportedLanguages: ['pt-BR', 'en'] },
  features: { mockBackend: false },
  logLevel: 'silent',
};

export function provideTestEnvironment(overrides: Partial<AppEnvironment> = {}): Provider {
  return { provide: APP_ENVIRONMENT, useValue: { ...TEST_ENVIRONMENT, ...overrides } };
}

/** Carrega o catálogo real de traduções (pt-BR por padrão) para testes de componentes. */
export async function loadTranslations(
  language: SupportedLanguage = 'pt-BR',
): Promise<TranslationService> {
  registerAppLocales();
  const translation = TestBed.inject(TranslationService);
  await translation.use(language);
  return translation;
}

/** Simula a digitação do usuário em um input/textarea. */
export function typeInto(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  element.value = value;
  element.dispatchEvent(new Event('input'));
}

export function blur(element: HTMLElement): void {
  element.dispatchEvent(new Event('blur'));
}
