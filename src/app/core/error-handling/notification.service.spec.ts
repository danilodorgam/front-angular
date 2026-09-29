import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => vi.useRealTimers());

  it('mensagens de sucesso somem sozinhas', () => {
    service.success('estoque.edit.saved');
    expect(service.notifications()).toHaveLength(1);

    vi.advanceTimersByTime(6000);

    expect(service.notifications()).toHaveLength(0);
  });

  it('mensagens de erro permanecem até o usuário fechar', () => {
    service.error('errors.server');
    vi.advanceTimersByTime(60_000);
    expect(service.notifications()).toHaveLength(1);

    service.dismiss(service.notifications()[0].id);

    expect(service.notifications()).toHaveLength(0);
  });

  it('não empilha a mesma mensagem repetida', () => {
    service.error('errors.network');
    service.error('errors.network');
    service.error('errors.server');

    expect(service.notifications().map((n) => n.messageKey)).toEqual(['errors.network', 'errors.server']);
  });
});
