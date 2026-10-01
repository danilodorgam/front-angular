import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideTestEnvironment, TEST_ENVIRONMENT } from '@testing/test-helpers';
import { AppError } from './app-error';
import { handledErrors } from './http-context';
import { httpErrorInterceptor } from './http-error.interceptor';
import { NotificationService } from './notification.service';

describe('httpErrorInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let notifications: NotificationService;

  function setup(retryAttempts = 0) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        provideTestEnvironment({ api: { ...TEST_ENVIRONMENT.api, retryAttempts } }),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    notifications = TestBed.inject(NotificationService);
  }

  afterEach(() => backend.verify());

  it('converte a falha em AppError e notifica o usuário', () => {
    setup();
    let received: AppError | undefined;

    http.get('/itens').subscribe({ error: (error: AppError) => (received = error) });
    backend.expectOne('/itens').flush(null, { status: 500, statusText: 'Server Error' });

    expect(received).toMatchObject({ kind: 'server', status: 500 });
    expect(notifications.notifications().map((n) => n.messageKey)).toEqual(['errors.server']);
  });

  it('não notifica status tratados pela própria tela', () => {
    setup();
    let received: AppError | undefined;

    http.get('/itens/9', { context: handledErrors(404) }).subscribe({ error: (e: AppError) => (received = e) });
    backend.expectOne('/itens/9').flush(null, { status: 404, statusText: 'Not Found' });

    expect(received?.kind).toBe('not-found');
    expect(notifications.notifications()).toEqual([]);
  });

  it('identifica falha de rede (status 0)', () => {
    setup();
    let received: AppError | undefined;

    http.get('/itens').subscribe({ error: (e: AppError) => (received = e) });
    backend.expectOne('/itens').error(new ProgressEvent('error'));

    expect(received?.kind).toBe('network');
    expect(notifications.notifications()[0].messageKey).toBe('errors.network');
  });

  it('repete GETs em falhas transitórias', () => {
    vi.useFakeTimers();
    try {
      setup(1);
      let result: unknown;

      http.get('/itens').subscribe((body) => (result = body));
      backend.expectOne('/itens').flush(null, { status: 503, statusText: 'Unavailable' });
      vi.advanceTimersByTime(500);
      backend.expectOne('/itens').flush(['ok']);

      expect(result).toEqual(['ok']);
      expect(notifications.notifications()).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('não repete requisições que alteram dados', () => {
    setup(2);

    http.post('/itens', {}).subscribe({ error: () => undefined });
    backend.expectOne('/itens').flush(null, { status: 503, statusText: 'Unavailable' });

    backend.expectNone('/itens');
  });
});
