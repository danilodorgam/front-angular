import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { loadTranslations, provideTestEnvironment } from '@testing/test-helpers';
import { TextField } from '../text-field/text-field';
import { FormErrorSummary, SummaryField } from './form-error-summary';

@Component({
  imports: [FormErrorSummary, TextField],
  template: `
    <app-form-error-summary [form]="form" [submitAttempt]="attempt()" />
    <app-text-field
      inputId="campo-nome"
      label="estoque.fields.name"
      [control]="form.controls.name"
    />
    @if (showSku()) {
      <app-text-field
        inputId="campo-sku"
        label="estoque.fields.sku"
        [control]="form.controls.sku"
      />
    }
  `,
})
class Host {
  readonly attempt = signal(0);
  readonly showSku = signal(true);
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    sku: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(3)] }),
  });
}

/** Controle que não herda de BaseField: precisa ser declarado em `fields`. */
@Component({
  imports: [FormErrorSummary, ReactiveFormsModule],
  template: `
    <app-form-error-summary [form]="form" [fields]="fields" [submitAttempt]="1" />
    <select id="campo-tipo" [formControl]="form.controls.type"></select>
  `,
})
class ManualHost {
  readonly form = new FormGroup({
    type: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly fields: SummaryField[] = [
    { name: 'type', inputId: 'campo-tipo', label: 'estoque.fields.name' },
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

  it('lista os erros dos campos registrados, na ordem da tela, e recebe o foco', async () => {
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

  it('deixa de listar um campo removido da tela', async () => {
    const { fixture, host, root } = await setup();
    host.form.controls.sku.setValue('ABCDE');
    host.attempt.set(1);
    await fixture.whenStable();

    host.showSku.set(false);
    await fixture.whenStable();

    const links = Array.from(root.querySelectorAll('.error-summary a'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['#campo-nome']);
  });

  it('some quando todos os erros são corrigidos', async () => {
    const { fixture, host, root } = await setup();
    host.attempt.set(1);
    await fixture.whenStable();

    host.form.controls.name.setValue('Papel');
    await fixture.whenStable();

    expect(root.querySelector('.error-summary')).toBeNull();
  });

  it('aceita a lista manual `fields` para controles que não são BaseField', async () => {
    TestBed.configureTestingModule({ providers: [provideTestEnvironment()] });
    await loadTranslations();
    const fixture = TestBed.createComponent(ManualHost);
    await fixture.whenStable();

    const link = (fixture.nativeElement as HTMLElement).querySelector('.error-summary a');
    expect(link?.getAttribute('href')).toBe('#campo-tipo');
    expect(link?.textContent).toContain('Preencha o campo Nome.');
  });
});
