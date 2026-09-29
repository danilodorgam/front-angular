import { EnvironmentProviders, ErrorHandler, makeEnvironmentProviders } from '@angular/core';
import { GlobalErrorHandler } from './global-error-handler';

export function provideErrorHandling(): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: ErrorHandler, useClass: GlobalErrorHandler }]);
}
