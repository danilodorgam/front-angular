import { AppEnvironment } from './environment.model';

/** Desenvolvimento local: `ng serve` (configuração padrão do serve). */
export const environment: AppEnvironment = {
  name: 'development',
  production: false,
  appVersion: '1.0.0-dev',
  api: {
    baseUrl: 'http://localhost:8080/api',
    timeoutMs: 30000,
    retryAttempts: 0,
  },
  i18n: {
    defaultLanguage: 'pt-BR',
    supportedLanguages: ['pt-BR', 'en'],
  },
  features: {
    // Troque para false quando o backend local estiver no ar.
    mockBackend: true,
  },
  logLevel: 'debug',
};
