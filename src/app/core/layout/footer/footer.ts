import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_ENVIRONMENT } from '../../../../environments/environment.token';
import { LANDMARK_IDS } from '../../accessibility/accessibility-bar/accessibility-bar';
import { TranslatePipe } from '../../localization/translate.pipe';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer [id]="footerId" class="footer" tabindex="-1">
      <p>{{ 'common.footer.text' | translate }}</p>
      <p class="footer__meta">
        <span>{{ 'common.footer.version' | translate: { version: env.appVersion } }}</span>
        @if (!env.production) {
          <span>{{ 'common.footer.environment' | translate: { name: env.name } }}</span>
        }
        <a routerLink="/acessibilidade">{{ 'common.footer.accessibility' | translate }}</a>
      </p>
    </footer>
  `,
  styles: `
    .footer {
      padding: 1.5rem 1rem;
      background: var(--color-footer-bg);
      color: var(--color-footer-text);

      a {
        color: inherit;
      }
      p {
        margin: 0.25rem 0;
      }
      &:focus {
        outline: none;
      }
    }
    .footer__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1.5rem;
      font-size: 0.875rem;
    }
  `,
})
export class Footer {
  protected readonly env = inject(APP_ENVIRONMENT);
  protected readonly footerId = LANDMARK_IDS.footer;
}
