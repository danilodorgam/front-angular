import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { focusElementById } from '@core/accessibility/focus';
import { TranslatePipe } from '@core/localization/translate.pipe';
import { TranslationService } from '@core/localization/translation.service';
import { uniqueId } from '@shared/utils/unique-id';
import { translateValidationError } from '@shared/validation/error-message-mapping/validation-messages';
import { FormFieldRegistry } from '../form-field-registry';

/**
 * Declaração manual de campo, só necessária para controles que não herdam de `BaseField`
 * (os campos compartilhados se registram sozinhos no `FormFieldRegistry`).
 */
export interface SummaryField {
  /** Nome do controle no FormGroup. */
  readonly name: string;
  /** `inputId` do campo, para o link levar o foco até ele. */
  readonly inputId: string;
  /** Chave de tradução do rótulo. */
  readonly label: string;
}

interface SummaryError {
  readonly inputId: string;
  readonly message: string;
}

/**
 * Resumo de erros exibido no topo do formulário após uma tentativa de envio.
 * Recebe o foco automaticamente e cada item é um link para o campo com problema
 * (e-MAG 6.5 – identificar e descrever erros de entrada de dados).
 *
 * Uso: `<app-form-error-summary [form]="form" [submitAttempt]="submitAttempt()" />`.
 * Os campos (`app-text-field`, `app-email-field`...) ligados a esse formulário aparecem
 * automaticamente, na ordem da tela, com o rótulo e o id declarados no próprio campo.
 */
@Component({
  selector: 'app-form-error-summary',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-error-summary.html',
})
export class FormErrorSummary {
  private readonly translation = inject(TranslationService);
  private readonly injector = inject(Injector);
  private readonly registry = inject(FormFieldRegistry);

  readonly form = input.required<AbstractControl>();
  /** Opcional: substitui os campos registrados automaticamente. */
  readonly fields = input<readonly SummaryField[] | null>(null);
  /** Incrementado pelo formulário a cada envio; o resumo só aparece depois do primeiro. */
  readonly submitAttempt = input(0);

  protected readonly headingId = uniqueId('resumo-erros');
  private readonly container = viewChild<ElementRef<HTMLElement>>('container');
  private readonly version = signal(0);

  private readonly registeredFields = computed(() => this.registry.fieldsOf(this.form())());

  protected readonly errors = computed<SummaryError[]>(() => {
    this.version();
    const form = this.form();
    const manual = this.fields();
    const fields = manual
      ? manual.map((field) => ({ ...field, control: form.get(field.name) }))
      : this.registeredFields();
    return fields.flatMap(({ control, inputId, label }) => {
      if (!control || control.valid || control.disabled) {
        return [];
      }
      const message = translateValidationError(this.translation, control.errors, label);
      return message ? [{ inputId, message }] : [];
    });
  });

  protected readonly visible = computed(() => this.submitAttempt() > 0 && this.errors().length > 0);

  constructor() {
    effect((onCleanup) => {
      const subscription = this.form().events.subscribe(() => this.version.update((v) => v + 1));
      onCleanup(() => subscription.unsubscribe());
    });

    effect(() => {
      if (this.submitAttempt() > 0) {
        afterNextRender(() => this.container()?.nativeElement.focus(), { injector: this.injector });
      }
    });
  }

  protected focusField(event: Event, inputId: string): void {
    event.preventDefault();
    focusElementById(inputId);
  }
}
