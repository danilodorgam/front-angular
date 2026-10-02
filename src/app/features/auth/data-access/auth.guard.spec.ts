import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('guards de autenticação', () => {
  const authenticated = signal(false);
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/estoque/novo' } as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: authenticated } },
      ],
    });
  });

  it('authGuard libera usuário autenticado', () => {
    authenticated.set(true);

    expect(TestBed.runInInjectionContext(() => authGuard(route, state))).toBe(true);
  });

  it('authGuard redireciona para o login guardando a página de destino', () => {
    authenticated.set(false);

    const result = TestBed.runInInjectionContext(() => authGuard(route, state)) as UrlTree;

    expect(result.toString()).toBe('/auth/entrar?returnUrl=%2Festoque%2Fnovo');
  });

  it('guestGuard tira da tela de login quem já está autenticado', () => {
    authenticated.set(true);

    const result = TestBed.runInInjectionContext(() => guestGuard(route, state)) as UrlTree;

    expect(result.toString()).toBe('/');
  });
});
