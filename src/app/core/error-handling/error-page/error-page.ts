import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../localization/translate.pipe';

/**
 * Página genérica de erro. O conteúdo vem do `data` da rota
 * (vinculado aos inputs por `withComponentInputBinding`).
 */
@Component({
  selector: 'app-error-page',
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="error-page">
      <p class="error-page__code" aria-hidden="true">{{ code() }}</p>
      <h1>{{ titleKey() | translate }}</h1>
      <p>{{ messageKey() | translate }}</p>
      <a routerLink="/" class="btn btn--primary">{{ 'errors.pages.backHome' | translate }}</a>
    </section>
  `,
  styles: `
    .error-page {
      max-width: 40rem;
      padding: 2rem 0;
    }
    .error-page__code {
      margin: 0;
      color: var(--color-primary);
      font-size: 4rem;
      font-weight: 700;
      line-height: 1;
    }
  `,
})
export class ErrorPage {
  readonly code = input<number>(404);
  readonly titleKey = input('errors.pages.notFound.title');
  readonly messageKey = input('errors.pages.notFound.message');
}
