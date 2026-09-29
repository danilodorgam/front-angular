import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { TitleStrategy } from '@angular/router';
import { AccessibilityService } from './accessibility.service';
import { AppTitleStrategy } from './app-title.strategy';

export function provideAccessibility(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: TitleStrategy, useExisting: AppTitleStrategy },
    // Aplica contraste e tamanho de fonte salvos antes da primeira renderização.
    provideAppInitializer(() => {
      inject(AccessibilityService);
    }),
  ]);
}
