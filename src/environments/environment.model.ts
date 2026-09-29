import type { SupportedLanguage } from '../app/core/localization/language';

export type EnvironmentName = 'development' | 'homologacao' | 'production';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

/**
 * Contrato único de configuração por ambiente.
 * Cada arquivo `environment.*.ts` implementa esta interface; o Angular CLI troca o arquivo
 * no build de acordo com a configuração escolhida (ver `fileReplacements` no angular.json).
 */
export interface AppEnvironment {
  readonly name: EnvironmentName;
  readonly production: boolean;
  readonly appVersion: string;
  readonly api: {
    /** URL base do backend, sem barra no final. */
    readonly baseUrl: string;
    /** Tempo máximo de espera por uma resposta HTTP. */
    readonly timeoutMs: number;
    /** Quantidade de novas tentativas para GETs com falha de rede ou 502/503/504. */
    readonly retryAttempts: number;
  };
  readonly i18n: {
    readonly defaultLanguage: SupportedLanguage;
    readonly supportedLanguages: readonly SupportedLanguage[];
  };
  readonly features: {
    /** Intercepta as chamadas HTTP e responde com dados em memória (ver src/mocks). */
    readonly mockBackend: boolean;
  };
  readonly logLevel: LogLevel;
}
