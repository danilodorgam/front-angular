import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BaseField } from '../base-field';
import { FieldFrame } from '../field-frame/field-frame';

/**
 * Campo que aceita somente e-mail:
 * - bloqueia espaços durante a digitação;
 * - normaliza para minúsculas ao sair do campo;
 * - abre o teclado de e-mail no celular (`inputmode="email"`).
 *
 * A validação de formato fica explícita no formulário: `AppValidators.email`.
 */
@Component({
  selector: 'app-email-field',
  imports: [FieldFrame],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-field-frame [field]="this">
      <input
        class="field__input"
        type="email"
        inputmode="email"
        spellcheck="false"
        autocapitalize="none"
        [id]="inputId()"
        [value]="state().value"
        [attr.autocomplete]="autocomplete()"
        [attr.maxlength]="maxlength()"
        [required]="state().required"
        [disabled]="state().disabled"
        [attr.aria-invalid]="showError() || null"
        [attr.aria-describedby]="describedBy()"
        (input)="onInput($event)"
        (blur)="onBlur()"
      />
    </app-field-frame>
  `,
})
export class EmailField extends BaseField<string> {
  readonly autocomplete = input('email');
  readonly maxlength = input(254);

  protected onInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    const sanitized = element.value.replace(/\s+/g, '');
    if (sanitized !== element.value) {
      element.value = sanitized;
    }
    this.setValue(sanitized);
  }

  protected onBlur(): void {
    const current = this.control().value ?? '';
    const normalized = current.trim().toLowerCase();
    if (normalized !== current) {
      this.setValue(normalized);
    }
    this.markAsTouched();
  }
}
