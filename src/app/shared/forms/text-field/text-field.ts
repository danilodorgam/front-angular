import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { filterCharset, TextCharset } from '@shared/validation/charsets';
import { BaseField } from '../base-field';
import { FieldFrame } from '../field-frame/field-frame';
import {
  applyMask,
  caretAfter,
  maskAcceptsLetters,
  maskMaxLength,
  MaskPattern,
  unmask,
} from '../mask/mask';

export type TextFieldType = 'text' | 'password' | 'search' | 'tel' | 'url';

/**
 * Campo de texto simples.
 * Uso: `<app-text-field label="estoque.fields.name" [control]="form.controls.name" />`
 *
 * Com `charset`, caracteres fora do conjunto são descartados durante a digitação
 * (ex.: `charset="letters"` para nomes). Combine com o validador correspondente
 * (`AppValidators.letters`), que também cobre valores colados ou vindos do backend.
 *
 * Com `mask` (ex.: `[mask]="masks.cpf"`), o texto é formatado durante a digitação e o
 * FormControl guarda o valor mascarado ("529.982.247-25"). Os validadores de `BrValidators`
 * aceitam os dois formatos; para enviar ao backend sem máscara use `unmask()`.
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
        [value]="displayValue()"
        [attr.autocomplete]="autocomplete()"
        [attr.maxlength]="effectiveMaxlength()"
        [attr.inputmode]="inputMode()"
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
  /** Máscara de digitação (veja `MASKS`). Quando definida, prevalece sobre `charset`. */
  readonly mask = input<MaskPattern | null>(null);

  protected readonly effectiveMaxlength = computed(() => {
    const mask = this.mask();
    return mask ? maskMaxLength(mask) : this.maxlength();
  });

  protected readonly inputMode = computed(() => {
    const mask = this.mask();
    if (mask) {
      return maskAcceptsLetters(mask) ? null : 'numeric';
    }
    return this.charset() === 'digits' ? 'numeric' : null;
  });

  /** Valores definidos pelo código sem máscara ("52998224725") também são exibidos formatados. */
  protected readonly displayValue = computed(() => {
    const value = this.state().value ?? '';
    const mask = this.mask();
    return mask ? applyMask(value, mask) : value;
  });

  protected onInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    const raw = element.value;
    const caretInRaw = element.selectionStart ?? raw.length;
    const mask = this.mask();

    let next: string;
    let caret: number;
    if (mask) {
      next = applyMask(raw, mask);
      // Conta só o que sobrevive à máscara (ex.: uma letra digitada num CPF é descartada).
      caret = caretAfter(next, unmask(applyMask(raw.slice(0, caretInRaw), mask)).length);
    } else {
      next = filterCharset(raw, this.charset());
      caret = filterCharset(raw.slice(0, caretInRaw), this.charset()).length;
    }

    if (next !== raw) {
      // Mantém o cursor no lugar quando o texto é reformatado ou um caractere é descartado.
      element.value = next;
      element.setSelectionRange(caret, caret);
    }
    this.setValue(next);
  }
}
