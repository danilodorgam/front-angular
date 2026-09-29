import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

/**
 * Dados de formatação (datas, números, moeda) usados pelos pipes do Angular.
 * O locale "en" já vem embutido; os demais precisam ser registrados.
 */
export function registerAppLocales(): void {
  registerLocaleData(localePt, 'pt-BR');
}
