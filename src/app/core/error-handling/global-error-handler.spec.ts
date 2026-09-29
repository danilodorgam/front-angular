import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideTestEnvironment } from '../../../testing/test-helpers';
import { GlobalErrorHandler } from './global-error-handler';
import { toAppError } from './http-error.mapper';
import { NotificationService } from './notification.service';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let notifications: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideTestEnvironment(), GlobalErrorHandler] });
    handler = TestBed.inject(GlobalErrorHandler);
    notifications = TestBed.inject(NotificationService);
  });

  it('exibe mensagem genérica para exceções não tratadas', () => {
    handler.handleError(new TypeError('Cannot read properties of undefined'));

    expect(notifications.notifications().map((n) => n.messageKey)).toEqual(['errors.unexpected']);
  });

  it('não duplica a notificação de erros HTTP (já tratados pelo interceptor)', () => {
    handler.handleError(toAppError(new HttpErrorResponse({ status: 500 })));
    handler.handleError(new HttpErrorResponse({ status: 404 }));

    expect(notifications.notifications()).toEqual([]);
  });
});
