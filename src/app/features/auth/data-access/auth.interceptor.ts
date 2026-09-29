import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { APP_ENVIRONMENT } from '../../../../environments/environment.token';
import { isAppError } from '../../../core/error-handling/app-error';
import { AuthService } from './auth.service';

/**
 * Anexa o token às chamadas para o backend da aplicação (nunca para terceiros)
 * e encerra a sessão quando o backend responde 401.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  if (!token || !req.url.startsWith(inject(APP_ENVIRONMENT).api.baseUrl)) {
    return next(req);
  }

  const router = inject(Router);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: unknown) => {
      if (isAppError(error) && error.kind === 'unauthorized') {
        auth.expireSession(router.url);
      }
      return throwError(() => error);
    }),
  );
};
