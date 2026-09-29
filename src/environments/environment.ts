import { AppEnvironment } from './environment.model';

/** Produção (configuração padrão do `ng build`). */
export const environment: AppEnvironment = {
  name: 'production',
  production: true,
  appVersion: '1.0.0',
  api: {
    baseUrl: 'https://api.exemplo.gov.br/v1',
    timeoutMs: 15000,
    retryAttempts: 2,
  },
  i18n: {
    defaultLanguage: 'pt-BR',
    supportedLanguages: ['pt-BR', 'en'],
  },
  features: {
    mockBackend: false,
  },
  logLevel: 'error',
};
