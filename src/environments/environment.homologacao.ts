import { AppEnvironment } from './environment.model';

/** Homologação: `ng build --configuration homologacao`. */
export const environment: AppEnvironment = {
  name: 'homologacao',
  production: true,
  appVersion: '1.0.0-hmg',
  api: {
    baseUrl: 'https://api-hmg.exemplo.gov.br/v1',
    timeoutMs: 20000,
    retryAttempts: 1,
  },
  i18n: {
    defaultLanguage: 'pt-BR',
    supportedLanguages: ['pt-BR', 'en'],
  },
  features: {
    mockBackend: false,
  },
  logLevel: 'warn',
};
