import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { loadTranslations, provideTestEnvironment } from '@testing/test-helpers';
import { TextField } from '../text-field/text-field';
import { FormErrorSummary, SummaryField } from './form-error-summary';

@Component({
  imports: [FormErrorSummary, TextField],
  template: `
    <app-form-error-summary [form]="form" [fields]="fields" [submitAttempt]="attempt()" />
    <app-text-field inputId="campo-nome" label="estoque.fields.name" [control]="form.controls.name" />
    <app-text-field inputId="campo-sku" label="estoque.fields.sku" [control]="form.controls.sku" />
  `,
})
class Host {
  readonly attempt = signal(0);
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    sku: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(3)] }),
  });
  readonly fields: SummaryField[] = [
    { name: 'name', inputId: 'campo-nome', label: 'estoque.fields.name' },
    { name: 'sku', inputId: 'campo-sku', label: 'estoque.fields.sku' },
  ];
}

describe('FormErrorSummary', () => {
  async function setup() {
    TestBed.configureTestingModule({ providers: [provideTestEnvironment()] });
    await loadTranslations();
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    return { fixture, host: fixture.componentInstance, root: fixture.nativeElement as HTMLElement };
  }

  it('fica oculto antes da primeira tentativa de envio', async () => {
    const { root } = await setup();

    expect(root.querySelector('.error-summary')).toBeNull();
  });

  it('lista os erros com links para cada campo e recebe o foco após o envio', async () => {
    const { fixture, host, root } = await setup();
    host.form.controls.sku.setValue('ABCDE');

    host.attempt.set(1);
    await fixture.whenStable();

    const summary = root.querySelector('.error-summary') as HTMLElement;
    const links = Array.from(summary.querySelectorAll('a'));
    expect(summary.querySelector('h2')?.textContent).toContain('Há problemas no formulário');
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['#campo-nome', '#campo-sku']);
    expect(links[0].textContent).toContain('Preencha o campo Nome.');
    expect(document.activeElement).toBe(summary);
  });

  it('o link leva o foco para o campo com erro', async () => {
    const { fixture, host, root } = await setup();
    host.attempt.set(1);
    await fixture.whenStable();

    (root.querySelector('.error-summary a') as HTMLAnchorElement).click();

    expect(document.activeElement?.id).toBe('campo-nome');
  });

  it('some quando todos os erros são corrigidos', async () => {
    const { fixture, host, root } = await setup();
    host.attempt.set(1);
    await fixture.whenStable();

    host.form.controls.name.setValue('Papel');
    await fixture.whenStable();

    expect(root.querySelector('.error-summary')).toBeNull();
  });
});
