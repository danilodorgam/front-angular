import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@core/localization/translate.pipe';
import { FieldView } from '../base-field';
import { FieldError } from '../field-error/field-error';

/** Moldura comum: rótulo, marcador de obrigatório, dica, o controle projetado e o erro. */
@Component({
  selector: 'app-field-frame',
  imports: [TranslatePipe, FieldError],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let f = field();
    <div
      class="field"
      [class.field--invalid]="f.showError()"
      [class.field--disabled]="f.state().disabled"
    >
      <label class="field__label" [for]="f.inputId()">
        {{ f.label() | translate }}
        @if (f.state().required) {
          <span class="field__required" aria-hidden="true">*</span>
        }
      </label>
      @if (f.hint(); as hint) {
        <p class="field__hint" [id]="f.hintId()">{{ hint | translate }}</p>
      }
      <ng-content />
      @if (f.showError()) {
        <app-field-error [errorId]="f.errorId()" [errors]="f.state().errors" [fieldLabel]="f.label()" />
      }
    </div>
  `,
})
export class FieldFrame {
  readonly field = input.required<FieldView>();
}
