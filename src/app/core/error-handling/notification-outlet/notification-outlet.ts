import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@core/localization/translate.pipe';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-notification-outlet',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="notifications" [attr.aria-label]="'errors.notification.region' | translate">
      @for (item of service.notifications(); track item.id) {
        <div
          class="notification notification--{{ item.type }}"
          [attr.role]="item.type === 'error' || item.type === 'warning' ? 'alert' : 'status'"
        >
          <p class="notification__message">{{ item.messageKey | translate: item.params }}</p>
          <button
            type="button"
            class="notification__close"
            [attr.aria-label]="'errors.notification.dismiss' | translate"
            (click)="service.dismiss(item.id)"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      }
    </section>
  `,
  styleUrl: './notification-outlet.scss',
})
export class NotificationOutlet {
  protected readonly service = inject(NotificationService);
}
