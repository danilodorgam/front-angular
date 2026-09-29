import { InjectionToken, Signal, signal } from '@angular/core';

/**
 * O layout precisa saber quem está logado, mas o core não deve depender de uma feature.
 * A feature de autenticação fornece a implementação (ver `provideAuth`).
 */
export interface LayoutSession {
  readonly userName: Signal<string | null>;
  signOut(): void;
}

export const LAYOUT_SESSION = new InjectionToken<LayoutSession>('LAYOUT_SESSION', {
  providedIn: 'root',
  factory: () => ({ userName: signal(null), signOut: () => undefined }),
});
