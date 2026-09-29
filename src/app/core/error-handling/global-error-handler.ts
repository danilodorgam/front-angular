import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { isAppError } from './app-error';
import { LoggerService } from './logger.service';
import { NotificationService } from './notification.service';

/**
 * Captura exceções não tratadas (erros em componentes, promises rejeitadas,
 * `window.onerror` via `provideBrowserGlobalErrorListeners`).
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(LoggerService);
  private readonly notifications = inject(NotificationService);

  handleError(error: unknown): void {
    // Falhas HTTP já foram notificadas pelo httpErrorInterceptor.
    if (isAppError(error) || error instanceof HttpErrorResponse) {
      this.logger.debug('Erro HTTP não tratado pela tela', error);
      return;
    }
    this.logger.error('Erro não tratado', error);
    this.notifications.error('errors.unexpected');
  }
}
