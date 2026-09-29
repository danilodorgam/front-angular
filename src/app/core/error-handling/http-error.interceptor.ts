import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, throwError, timeout, timer } from 'rxjs';
import { APP_ENVIRONMENT } from '../../../environments/environment.token';
import { HANDLED_ERROR_STATUSES } from './http-context';
import { isRetryable, toAppError } from './http-error.mapper';
import { LoggerService } from './logger.service';
import { NotificationService } from './notification.service';

/**
 * Tratamento centralizado das falhas HTTP:
 * - aplica timeout a todas as requisições;
 * - repete GETs em falhas transitórias (rede, 502, 503, 504) com backoff;
 * - converte o erro em `AppError` e exibe a mensagem traduzida ao usuário,
 *   exceto quando a tela declarou que trata aquele status (`handledErrors(...)`).
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const env = inject(APP_ENVIRONMENT);
  const logger = inject(LoggerService);
  const notifications = inject(NotificationService);

  return next(req).pipe(
    timeout({ each: env.api.timeoutMs }),
    retry({
      count: req.method === 'GET' ? env.api.retryAttempts : 0,
      delay: (error: unknown, attempt) =>
        isRetryable(error) ? timer(attempt * 500) : throwError(() => error),
    }),
    catchError((error: unknown) => {
      const appError = toAppError(error);
      logger.warn(`${req.method} ${req.urlWithParams} falhou (${appError.kind})`, error);

      const handled = req.context.get(HANDLED_ERROR_STATUSES);
      if (appError.status === null || !handled.includes(appError.status)) {
        notifications.error(appError.messageKey);
      }
      return throwError(() => appError);
    }),
  );
};
