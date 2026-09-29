import { HttpContext, HttpContextToken } from '@angular/common/http';

/**
 * Status HTTP que a própria tela vai tratar (ex.: 401 no login, 404 no detalhe).
 * Para esses status o interceptor não exibe a notificação global.
 */
export const HANDLED_ERROR_STATUSES = new HttpContextToken<readonly number[]>(() => []);

export function handledErrors(...statuses: number[]): HttpContext {
  return new HttpContext().set(HANDLED_ERROR_STATUSES, statuses);
}
