import { Directive, Signal, computed, effect, inject, input, signal } from '@angular/core';
import { FormControl, ValidationErrors, Validators } from '@angular/forms';
import { uniqueId } from '@shared/utils/unique-id';
import { FormFieldRegistry } from './form-field-registry';

export interface FieldState<T> {
  readonly value: T;
  readonly invalid: boolean;
  readonly touched: boolean;
  readonly disabled: boolean;
  readonly required: boolean;
  readonly errors: ValidationErrors | null;
}

/** O que o `FieldFrame` precisa ler de qualquer campo. */
export interface FieldView {
  readonly label: Signal<string>;
  readonly hint: Signal<string | undefined>;
  readonly inputId: Signal<string>;
  readonly hintId: Signal<string>;
  readonly errorId: Signal<string>;
  readonly showError: Signal<boolean>;
  readonly state: Signal<FieldState<unknown>>;
}

/**
 * Base dos campos de formulário compartilhados.
 *
 * Recebe o `FormControl` por input e expõe o estado dele como signals, o que permite
 * componentes OnPush/zoneless reagirem a `markAllAsTouched()`, `setErrors()` etc.
 *
 * Acessibilidade (e-MAG 6.2 e 6.5):
 * - label associado ao campo por `for`/`id`;
 * - dica e erro associados por `aria-describedby`;
 * - `aria-invalid` + borda vermelha + ícone + texto (não depende só da cor);
 * - o erro só aparece depois que o usuário sai do campo ou tenta enviar o formulário.
 */
@Directive()
export abstract class BaseField<T> implements FieldView {
  readonly control = input.required<FormControl<T>>();
  /** Chave de tradução do rótulo. */
  readonly label = input.required<string>();
  /** Chave de tradução do texto de ajuda exibido abaixo do rótulo. */
  readonly hint = input<string>();
  readonly inputId = input(uniqueId('campo'));

  private readonly version = signal(0);

  readonly state = computed<FieldState<T>>(() => {
    this.version();
    const control = this.control();
    return {
      value: control.value,
      invalid: control.invalid,
      touched: control.touched,
      disabled: control.disabled,
      required: control.hasValidator(Validators.required),
      errors: control.errors,
    };
  });

  readonly showError = computed(() => this.state().invalid && this.state().touched);
  readonly hintId = computed(() => `${this.inputId()}-dica`);
  readonly errorId = computed(() => `${this.inputId()}-erro`);
  readonly describedBy = computed(() => {
    const ids = [this.hint() ? this.hintId() : null, this.showError() ? this.errorId() : null];
    return ids.filter(Boolean).join(' ') || null;
  });

  constructor() {
    effect((onCleanup) => {
      const subscription = this.control().events.subscribe(() => this.version.update((v) => v + 1));
      onCleanup(() => subscription.unsubscribe());
    });

    // Torna o campo visível para o FormErrorSummary do mesmo formulário.
    const registry = inject(FormFieldRegistry);
    effect((onCleanup) => {
      const unregister = registry.register({
        control: this.control(),
        inputId: this.inputId(),
        label: this.label(),
      });
      onCleanup(unregister);
    });
  }

  markAsTouched(): void {
    this.control().markAsTouched();
  }

  protected setValue(value: T): void {
    const control = this.control();
    control.setValue(value);
    control.markAsDirty();
  }
}
