import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { TranslationService } from '@core/localization/translation.service';
import { BaseField } from '../base-field';
import { FieldFrame } from '../field-frame/field-frame';
import { decimalSeparatorFor, formatNumeric, parseNumeric, sanitizeNumeric } from './numeric';

/**
 * Campo que aceita somente números. O valor no FormControl é `number | null`.
 *
 * Usa `type="text"` + `inputmode` em vez de `type="number"`: o `type="number"` aceita
 * "e", "+" e "-", altera o valor com a rolagem do mouse e é mal anunciado por
 * leitores de tela.
 */
@Component({
  selector: 'app-number-field',
  imports: [FieldFrame],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-field-frame [field]="this">
      <input
        class="field__input field__input--number"
        type="text"
        autocomplete="off"
        [attr.inputmode]="inputMode()"
        [id]="inputId()"
        [value]="displayValue()"
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
export class NumberField extends BaseField<number | null> {
  private readonly translation = inject(TranslationService);

  readonly allowDecimal = input(false);
  /** Aceita valores negativos (o "-" só é aceito no início). */
  readonly allowNegative = input(false);
  /** Limite de casas decimais (ex.: 2 para dinheiro). Ao sair do campo, o valor é exibido com essa precisão. */
  readonly decimalPlaces = input<number | null>(null);
  readonly maxlength = input(15);

  /**
   * Teclado no celular. Os teclados "numeric"/"decimal" do iOS não têm o sinal de menos,
   * então campos que aceitam negativos usam o teclado de texto.
   */
  protected readonly inputMode = computed(() => {
    if (this.allowNegative()) {
      return 'text';
    }
    return this.allowDecimal() ? 'decimal' : 'numeric';
  });

  /** Texto enquanto o usuário digita (ex.: "12," ainda não é um número completo). */
  private readonly draft = signal<string | null>(null);

  protected readonly displayValue = computed(
    () =>
      this.draft() ??
      formatNumeric(
        this.state().value,
        decimalSeparatorFor(this.translation.language()),
        this.allowDecimal() ? this.decimalPlaces() : null,
      ),
  );

  protected onInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    const sanitized = sanitizeNumeric(element.value, {
      allowDecimal: this.allowDecimal(),
      allowNegative: this.allowNegative(),
      decimalPlaces: this.decimalPlaces(),
    });
    if (sanitized !== element.value) {
      element.value = sanitized;
    }
    this.draft.set(sanitized);
    this.setValue(parseNumeric(sanitized));
  }

  protected onBlur(): void {
    this.draft.set(null);
    this.markAsTouched();
  }
}
