import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { isSupportedLanguage, LANGUAGE_LABELS } from '../language';
import { TranslatePipe } from '../translate.pipe';
import { TranslationService } from '../translation.service';

@Component({
  selector: 'app-language-switcher',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="language-switcher">
      <span class="sr-only">{{ 'common.language.label' | translate }}</span>
      <select class="language-switcher__select" (change)="change($event)">
        @for (language of translation.supportedLanguages; track language) {
          <!-- e-MAG 3.1: cada opção declara o próprio idioma -->
          <option
            [value]="language"
            [attr.lang]="language"
            [selected]="language === translation.language()"
          >
            {{ labels[language] }}
          </option>
        }
      </select>
    </label>
  `,
  styles: `
    .language-switcher__select {
      min-height: 2.5rem;
      padding: 0 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background: var(--color-bg);
      color: var(--color-text);
      font: inherit;
    }
  `,
})
export class LanguageSwitcher {
  protected readonly translation = inject(TranslationService);
  protected readonly labels = LANGUAGE_LABELS;

  protected change(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (isSupportedLanguage(value)) {
      void this.translation.use(value);
    }
  }
}
