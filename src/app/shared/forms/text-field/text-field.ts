import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BaseField } from '../base-field';
import { FieldFrame } from '../field-frame/field-frame';

export type TextFieldType = 'text' | 'password' | 'search' | 'tel' | 'url';

/**
 * Campo de texto simples.
 * Uso: `<app-text-field label="estoque.fields.name" [control]="form.controls.name" />`
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

  protected onInput(event: Event): void {
    this.setValue((event.target as HTMLInputElement).value);
  }
}
