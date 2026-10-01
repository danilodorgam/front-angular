import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { blur, loadTranslations, provideTestEnvironment, typeInto } from '@testing/test-helpers';
import { NumberField } from './number-field';

@Component({
  imports: [NumberField],
  template: `
    <app-number-field inputId="qtd" label="estoque.fields.quantity" [allowDecimal]="decimal()" [control]="control" />
  `,
})
class Host {
  readonly decimal = signal(false);
  control = new FormControl<number | null>(null, [Validators.required, Validators.min(0)]);
}

describe('NumberField', () => {
  async function setup(options: { decimal?: boolean; language?: 'pt-BR' | 'en' } = {}) {
    TestBed.configureTestingModule({ providers: [provideTestEnvironment()] });
    await loadTranslations(options.language ?? 'pt-BR');
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.decimal.set(options.decimal ?? false);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return { fixture, root, input: root.querySelector('input') as HTMLInputElement, control: fixture.componentInstance.control };
  }

  it('usa type="text" com teclado numérico', async () => {
    const { input } = await setup();

    expect(input.type).toBe('text');
    expect(input.getAttribute('inputmode')).toBe('numeric');
  });

  it('aceita somente dígitos e guarda um number no FormControl', async () => {
    const { input, control } = await setup();

    typeInto(input, '1a2b3');

    expect(input.value).toBe('123');
    expect(control.value).toBe(123);
  });

  it('campo vazio vira null e exibe erro de obrigatório ao sair', async () => {
    const { fixture, root, input, control } = await setup();

    typeInto(input, 'abc');
    blur(input);
    await fixture.whenStable();

    expect(control.value).toBeNull();
    expect(root.querySelector('.field-error')?.textContent).toContain('Preencha o campo Quantidade.');
  });

  it('aceita decimais com vírgula quando permitido', async () => {
    const { fixture, input, control } = await setup({ decimal: true });

    expect(input.getAttribute('inputmode')).toBe('decimal');
    typeInto(input, '12,50');
    blur(input);
    await fixture.whenStable();

    expect(control.value).toBe(12.5);
    expect(input.value).toBe('12,5');
  });

  it('formata o valor com o separador decimal do idioma', async () => {
    const { fixture, input, control } = await setup({ decimal: true, language: 'en' });

    control.setValue(7.25);
    await fixture.whenStable();

    expect(input.value).toBe('7.25');
  });
});
