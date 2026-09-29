import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { APP_ENVIRONMENT } from '../../../../environments/environment.token';
import { handledErrors } from '../../../core/error-handling/http-context';
import { LayoutSession } from '../../../core/layout/layout-session';
import { readStorage, writeStorage } from '../../../shared/utils/safe-storage';
import { AuthUser, PasswordRecoveryRequest, SignInRequest, SignInResponse } from './auth.models';

const SESSION_KEY = 'app.session';
export const SIGN_IN_PATH = '/auth/entrar';

/**
 * Sessão do usuário. O token fica no sessionStorage apenas para fins de exemplo;
 * em produção prefira cookie HttpOnly emitido pelo backend (ou OIDC com Keycloak/gov.br).
 */
@Injectable({ providedIn: 'root' })
export class AuthService implements LayoutSession {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${inject(APP_ENVIRONMENT).api.baseUrl}/auth`;

  private readonly session = signal<SignInResponse | null>(restoreSession());

  readonly user = computed<AuthUser | null>(() => this.session()?.user ?? null);
  readonly userName = computed(() => this.user()?.name ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);

  signIn(request: SignInRequest): Observable<AuthUser> {
    return this.http
      .post<SignInResponse>(`${this.baseUrl}/login`, request, { context: handledErrors(401) })
      .pipe(
        tap((response) => this.storeSession(response)),
        map((response) => response.user),
      );
  }

  requestPasswordRecovery(request: PasswordRecoveryRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/password-recovery`, request);
  }

  signOut(): void {
    this.storeSession(null);
    void this.router.navigateByUrl(SIGN_IN_PATH);
  }

  /** Chamado pelo interceptor quando o backend responde 401 a uma requisição autenticada. */
  expireSession(returnUrl: string): void {
    this.storeSession(null);
    void this.router.navigate([SIGN_IN_PATH], { queryParams: { returnUrl } });
  }

  private storeSession(session: SignInResponse | null): void {
    this.session.set(session);
    writeStorage(SESSION_KEY, session ? JSON.stringify(session) : null, 'session');
  }
}

function restoreSession(): SignInResponse | null {
  const raw = readStorage(SESSION_KEY, 'session');
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<SignInResponse>;
    return parsed.token && parsed.user ? (parsed as SignInResponse) : null;
  } catch {
    return null;
  }
}
