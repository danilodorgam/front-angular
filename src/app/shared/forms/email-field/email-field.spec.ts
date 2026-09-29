import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { blur, loadTranslations, provideTestEnvironment, typeInto } from '../../../../testing/test-helpers';
import { AppValidators } from '../../validation/validators/app-validators';
import { EmailField } from './email-field';

@Component({
  imports: [EmailField],
  template: `<app-email-field inputId="email" label="auth.signIn.email" [control]="control" />`,
})
class Host {
  control = new FormControl('', { nonNullable: true, validators: [Validators.required, AppValidators.email] });
}

describe('EmailField', () => {
  async function setup() {
    TestBed.configureTestingModule({ providers: [provideTestEnvironment()] });
    await loadTranslations();
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return { fixture, root, input: root.querySelector('input') as HTMLInputElement, control: fixture.componentInstance.control };
  }

  it('usa o tipo e o teclado de e-mail', async () => {
    const { input } = await setup();

    expect(input.type).toBe('email');
    expect(input.getAttribute('inputmode')).toBe('email');
    expect(input.getAttribute('autocomplete')).toBe('email');
  });

  it('não aceita espaços durante a digitação', async () => {
    const { input, control } = await setup();

    typeInto(input, ' maria @exemplo.gov.br ');

    expect(input.value).toBe('maria@exemplo.gov.br');
    expect(control.value).toBe('maria@exemplo.gov.br');
  });

  it('normaliza para minúsculas ao sair do campo', async () => {
    const { input, control } = await setup();

    typeInto(input, 'Maria@Exemplo.GOV.br');
    blur(input);

    expect(control.value).toBe('maria@exemplo.gov.br');
  });

  it('exibe mensagem de formato inválido', async () => {
    const { fixture, root, input } = await setup();

    typeInto(input, 'maria@exemplo');
    blur(input);
    await fixture.whenStable();

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('.field-error')?.textContent).toContain('Informe um e-mail válido');
  });
});
