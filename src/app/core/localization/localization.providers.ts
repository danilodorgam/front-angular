import {
  EnvironmentProviders,
  LOCALE_ID,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { registerAppLocales } from './locales';
import { TranslationService } from './translation.service';

/**
 * Registra os dados de locale (datas, números, moeda) e carrega o catálogo de
 * traduções antes da primeira renderização.
 */
export function provideLocalization(): EnvironmentProviders {
  registerAppLocales();

  return makeEnvironmentProviders([
    provideAppInitializer(() => inject(TranslationService).init()),
    { provide: LOCALE_ID, useFactory: () => inject(TranslationService).language() },
  ]);
}
