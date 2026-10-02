import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { TranslatePipe } from '@core/localization/translate.pipe';
import { TranslationService } from '@core/localization/translation.service';
import { translateValidationError } from '@shared/validation/error-message-mapping/validation-messages';

/** Mensagem de erro de um campo. O `id` é referenciado pelo `aria-describedby` do input. */
@Component({
  selector: 'app-field-error',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message(); as text) {
      <p class="field-error" [id]="errorId()">
        <span class="field-error__icon" aria-hidden="true">!</span>
        <span
          ><span class="sr-only">{{ 'validation.errorPrefix' | translate }} </span>{{ text }}</span
        >
      </p>
    }
  `,
})
export class FieldError {
  private readonly translation = inject(TranslationService);

  readonly errorId = input.required<string>();
  readonly errors = input<ValidationErrors | null>(null);
  /** Chave de tradução do rótulo, usada para montar a mensagem ("Preencha o campo Nome."). */
  readonly fieldLabel = input('');

  protected readonly message = computed(() =>
    translateValidationError(this.translation, this.errors(), this.fieldLabel()),
  );
}
