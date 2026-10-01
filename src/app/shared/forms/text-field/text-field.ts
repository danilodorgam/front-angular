import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { filterCharset, TextCharset } from '@shared/validation/charsets';
import { BaseField } from '../base-field';
import { FieldFrame } from '../field-frame/field-frame';

export type TextFieldType = 'text' | 'password' | 'search' | 'tel' | 'url';

/**
 * Campo de texto simples.
 * Uso: `<app-text-field label="estoque.fields.name" [control]="form.controls.name" />`
 *
 * Com `charset`, caracteres fora do conjunto são descartados durante a digitação
 * (ex.: `charset="letters"` para nomes). Combine com o validador correspondente
 * (`AppValidators.letters`), que também cobre valores colados ou vindos do backend.
 */
@Component({
  selector: 'app-text-field',
  imports: [FieldFrame],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-field-frame [field]="this">
      <input
        class="field__input"
        [id]="inputId()"
        [type]="type()"
        [value]="state().value"
        [attr.autocomplete]="autocomplete()"
        [attr.maxlength]="maxlength()"
        [attr.inputmode]="charset() === 'digits' ? 'numeric' : null"
        [required]="state().required"
        [disabled]="state().disabled"
        [attr.aria-invalid]="showError() || null"
        [attr.aria-describedby]="describedBy()"
        (input)="onInput($event)"
        (blur)="markAsTouched()"
      />
    </app-field-frame>
  `,
})
export class TextField extends BaseField<string> {
  readonly type = input<TextFieldType>('text');
  readonly autocomplete = input('off');
  readonly maxlength = input<number | null>(null);
  /** Caracteres aceitos na digitação: 'any' (padrão), 'letters', 'alphanumeric' ou 'digits'. */
  readonly charset = input<TextCharset>('any');

  protected onInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    const raw = element.value;
    const filtered = filterCharset(raw, this.charset());
    if (filtered !== raw) {
      // Mantém o cursor no lugar quando um caractere é descartado no meio do texto.
      const caret = filterCharset(
        raw.slice(0, element.selectionStart ?? raw.length),
        this.charset(),
      ).length;
      element.value = filtered;
      element.setSelectionRange(caret, caret);
    }
    this.setValue(filtered);
  }
}
