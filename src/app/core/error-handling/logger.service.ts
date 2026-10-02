import { Injectable, inject } from '@angular/core';
import { APP_ENVIRONMENT } from '@env/environment.token';
import { LogLevel } from '@env/environment.model';

const LEVEL_WEIGHT: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };

/**
 * Ponto único de log. Em produção pode ser estendido para enviar erros
 * a uma ferramenta de observabilidade (Sentry, Grafana Faro, etc.).
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly minLevel = LEVEL_WEIGHT[inject(APP_ENVIRONMENT).logLevel];

  debug(message: string, ...data: unknown[]): void {
    this.log('debug', message, data);
  }

  info(message: string, ...data: unknown[]): void {
    this.log('info', message, data);
  }

  warn(message: string, ...data: unknown[]): void {
    this.log('warn', message, data);
  }

  error(message: string, ...data: unknown[]): void {
    this.log('error', message, data);
  }

  private log(level: Exclude<LogLevel, 'silent'>, message: string, data: unknown[]): void {
    if (LEVEL_WEIGHT[level] >= this.minLevel) {
      console[level](`[${level.toUpperCase()}] ${message}`, ...data);
    }
  }
}
