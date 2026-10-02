import { Injectable, Signal, WritableSignal, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/** Campo exibido na tela, como o `FormErrorSummary` precisa enxergá-lo. */
export interface RegisteredField {
  readonly control: AbstractControl;
  /** `id` do input, para o link do resumo levar o foco até ele. */
  readonly inputId: string;
  /** Chave de tradução do rótulo. */
  readonly label: string;
}

/**
 * Cada campo compartilhado (`BaseField`) se registra aqui, agrupado pelo formulário raiz do seu
 * controle (`control.root`). O `FormErrorSummary` lê a lista do formulário que recebeu, então
 * rótulo e id ficam declarados num lugar só: no template do campo.
 */
@Injectable({ providedIn: 'root' })
export class FormFieldRegistry {
  private readonly byForm = new WeakMap<
    AbstractControl,
    WritableSignal<readonly RegisteredField[]>
  >();

  /** Registra o campo e devolve a função que o remove (chamada quando o campo é destruído). */
  register(field: RegisteredField): () => void {
    const fields = this.listFor(field.control.root);
    fields.update((list) => [...list, field]);
    return () => fields.update((list) => list.filter((item) => item !== field));
  }

  /** Campos do formulário, na ordem em que foram criados na tela. */
  fieldsOf(form: AbstractControl): Signal<readonly RegisteredField[]> {
    return this.listFor(form).asReadonly();
  }

  private listFor(form: AbstractControl): WritableSignal<readonly RegisteredField[]> {
    let fields = this.byForm.get(form);
    if (!fields) {
      fields = signal<readonly RegisteredField[]>([]);
      this.byForm.set(form, fields);
    }
    return fields;
  }
}
