import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { LAYOUT_SESSION } from '../../../core/layout/layout-session';
import { AuthService } from './auth.service';

/** Liga a sessão da feature de autenticação ao layout do core. */
export function provideAuth(): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: LAYOUT_SESSION, useExisting: AuthService }]);
}
