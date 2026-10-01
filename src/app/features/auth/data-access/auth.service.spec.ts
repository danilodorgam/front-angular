import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTestEnvironment } from '@testing/test-helpers';
import { HANDLED_ERROR_STATUSES } from '@core/error-handling/http-context';
import { SignInResponse } from './auth.models';
import { AuthService } from './auth.service';

const RESPONSE: SignInResponse = {
  token: 'abc',
  user: { id: '1', name: 'Maria Silva', email: 'maria@exemplo.gov.br', roles: [] },
};

describe('AuthService', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideTestEnvironment(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('autentica, guarda a sessão e expõe o usuário', () => {
    const auth = TestBed.inject(AuthService);

    auth.signIn({ email: 'maria@exemplo.gov.br', password: 'segredo' }).subscribe();
    const request = backend.expectOne('http://api.test/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.context.get(HANDLED_ERROR_STATUSES)).toEqual([401]);
    request.flush(RESPONSE);

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.userName()).toBe('Maria Silva');
    expect(auth.token()).toBe('abc');
    expect(JSON.parse(sessionStorage.getItem('app.session') ?? '{}').token).toBe('abc');
  });

  it('restaura a sessão salva ao recarregar a página', () => {
    sessionStorage.setItem('app.session', JSON.stringify(RESPONSE));

    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(true);
  });

  it('descarta sessão corrompida', () => {
    sessionStorage.setItem('app.session', '{não é json');

    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(false);
  });

  it('encerra a sessão e volta para o login', () => {
    sessionStorage.setItem('app.session', JSON.stringify(RESPONSE));
    const auth = TestBed.inject(AuthService);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    auth.signOut();

    expect(auth.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem('app.session')).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/auth/entrar');
  });
});
