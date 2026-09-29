import { InjectionToken } from '@angular/core';
import { environment } from './environment';
import { AppEnvironment } from './environment.model';

/**
 * Acesso à configuração do ambiente via injeção de dependência.
 * Prefira `inject(APP_ENVIRONMENT)` a importar `environment` diretamente:
 * nos testes basta sobrescrever o provider.
 */
export const APP_ENVIRONMENT = new InjectionToken<AppEnvironment>('APP_ENVIRONMENT', {
  providedIn: 'root',
  factory: () => environment,
});
