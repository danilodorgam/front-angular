import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@core/localization/translate.pipe';
import { BaseField } from '../base-field';
import { FieldFrame } from '../field-frame/field-frame';

/** Área de texto com contador de caracteres restantes (quando há `maxlength`). */
@Component({
  selector: 'app-textarea-field',
  imports: [FieldFrame, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-field-frame [field]="this">
      <textarea
        class="field__input field__input--textarea"
        [id]="inputId()"
        [rows]="rows()"
        [value]="state().value"
        [attr.maxlength]="maxlength()"
        [required]="state().required"
        [disabled]="state().disabled"
        [attr.aria-invalid]="showError() || null"
        [attr.aria-describedby]="textareaDescribedBy()"
        (input)="onInput($event)"
        (blur)="markAsTouched()"
      ></textarea>
      @if (remaining() !== null) {
        <p class="field__counter" [id]="counterId()">
          {{ 'common.charactersRemaining' | translate: { count: remaining() } }}
        </p>
      }
    </app-field-frame>
  `,
})
export class TextareaField extends BaseField<string> {
  readonly rows = input(4);
  readonly maxlength = input<number | null>(null);

  protected readonly counterId = computed(() => `${this.inputId()}-contador`);
  protected readonly remaining = computed(() => {
    const max = this.maxlength();
    return max === null ? null : max - (this.state().value?.length ?? 0);
  });
  protected readonly textareaDescribedBy = computed(
    () => [this.describedBy(), this.remaining() !== null ? this.counterId() : null].filter(Boolean).join(' ') || null,
  );

  protected onInput(event: Event): void {
    this.setValue((event.target as HTMLTextAreaElement).value);
  }
}
