import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTestEnvironment } from '@testing/test-helpers';
import { httpErrorInterceptor } from '@core/error-handling/http-error.interceptor';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  const token = signal<string | null>('abc');
  const expireSession = vi.fn();
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    expireSession.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideTestEnvironment(),
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor, httpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { token, expireSession } },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('envia o token apenas para o backend da aplicação', () => {
    http.get('http://api.test/estoque/itens').subscribe();
    http.get('https://terceiros.exemplo.com/dados').subscribe();

    expect(
      backend.expectOne('http://api.test/estoque/itens').request.headers.get('Authorization'),
    ).toBe('Bearer abc');
    expect(
      backend.expectOne('https://terceiros.exemplo.com/dados').request.headers.has('Authorization'),
    ).toBe(false);
  });

  it('encerra a sessão quando o backend responde 401', () => {
    http.get('http://api.test/estoque/itens').subscribe({ error: () => undefined });
    backend
      .expectOne('http://api.test/estoque/itens')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(expireSession).toHaveBeenCalledOnce();
  });
});
