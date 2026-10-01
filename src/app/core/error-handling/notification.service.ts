import { Injectable, signal } from '@angular/core';
import { TranslationParams } from '@core/localization/translation.types';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface AppNotification {
  readonly id: number;
  readonly type: NotificationType;
  readonly messageKey: string;
  readonly params?: TranslationParams;
}

const AUTO_DISMISS_MS = 6000;

/**
 * Fila de mensagens exibidas pelo `NotificationOutlet`.
 * Mensagens de erro e alerta NÃO somem sozinhas: o usuário precisa ter tempo
 * de ler (e-MAG 2.4 / WCAG 2.2.1 – tempo ajustável).
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 0;
  private readonly queue = signal<readonly AppNotification[]>([]);

  readonly notifications = this.queue.asReadonly();

  success(messageKey: string, params?: TranslationParams): void {
    this.push('success', messageKey, params);
  }

  info(messageKey: string, params?: TranslationParams): void {
    this.push('info', messageKey, params);
  }

  warning(messageKey: string, params?: TranslationParams): void {
    this.push('warning', messageKey, params);
  }

  error(messageKey: string, params?: TranslationParams): void {
    this.push('error', messageKey, params);
  }

  dismiss(id: number): void {
    this.queue.update((items) => items.filter((item) => item.id !== id));
  }

  clear(): void {
    this.queue.set([]);
  }

  private push(type: NotificationType, messageKey: string, params?: TranslationParams): void {
    // Evita empilhar a mesma mensagem quando várias requisições falham juntas.
    if (this.queue().some((item) => item.type === type && item.messageKey === messageKey)) {
      return;
    }
    const notification: AppNotification = { id: ++this.nextId, type, messageKey, params };
    this.queue.update((items) => [...items, notification]);

    if (type === 'success' || type === 'info') {
      setTimeout(() => this.dismiss(notification.id), AUTO_DISMISS_MS);
    }
  }
}
