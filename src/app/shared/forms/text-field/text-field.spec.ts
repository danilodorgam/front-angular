import { Component, signal } from '@angular/core';
import { TextCharset } from '@shared/validation/charsets';
import { MASKS, MaskPattern } from '../mask/mask';
import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { blur, loadTranslations, provideTestEnvironment, typeInto } from '@testing/test-helpers';
import { TextField } from './text-field';

@Component({
  imports: [TextField],
  template: `<app-text-field
    inputId="nome"
    label="estoque.fields.name"
    hint="estoque.hints.sku"
    [charset]="charset()"
    [mask]="mask()"
    [control]="control"
  />`,
})
class Host {
  readonly charset = signal<TextCharset>('any');
  readonly mask = signal<MaskPattern | null>(null);
  control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
}

describe('TextField', () => {
  async function setup(charset: TextCharset = 'any', mask: MaskPattern | null = null) {
    TestBed.configureTestingModule({ providers: [provideTestEnvironment()] });
    await loadTranslations();
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.charset.set(charset);
    fixture.componentInstance.mask.set(mask);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      root,
      input: root.querySelector('input') as HTMLInputElement,
      control: fixture.componentInstance.control,
    };
  }

  it('associa label, dica e marca o campo como obrigatório', async () => {
    const { root, input } = await setup();

    const label = root.querySelector('label') as HTMLLabelElement;
    expect(label.htmlFor).toBe('nome');
    expect(label.textContent).toContain('Nome');
    expect(label.querySelector('.field__required')?.getAttribute('aria-hidden')).toBe('true');
    expect(input.required).toBe(true);
    expect(input.getAttribute('aria-describedby')).toBe('nome-dica');
  });

  it('não mostra erro antes do usuário interagir', async () => {
    const { root, input } = await setup();

    expect(root.querySelector('.field--invalid')).toBeNull();
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('marca a borda vermelha e exibe a mensagem ao sair do campo obrigatório vazio', async () => {
    const { fixture, root, input } = await setup();

    blur(input);
    await fixture.whenStable();

    expect(root.querySelector('.field')?.classList).toContain('field--invalid');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('nome-dica nome-erro');
    expect(root.querySelector('#nome-erro')?.textContent).toContain('Preencha o campo Nome.');
  });

  it('exibe o erro quando o formulário chama markAllAsTouched()', async () => {
    const { fixture, root, control } = await setup();

    control.markAllAsTouched();
    await fixture.whenStable();

    expect(root.querySelector('.field--invalid')).not.toBeNull();
  });

  it('atualiza o FormControl ao digitar e remove o erro', async () => {
    const { fixture, root, input, control } = await setup();

    blur(input);
    typeInto(input, 'Papel A4');
    await fixture.whenStable();

    expect(control.value).toBe('Papel A4');
    expect(control.dirty).toBe(true);
    expect(root.querySelector('.field--invalid')).toBeNull();
  });

  it('charset="letters" descarta números e símbolos, mantendo acentos', async () => {
    const { input, control } = await setup('letters');

    typeInto(input, "Ana D'Ávila-Souza 2@");

    expect(input.value).toBe("Ana D'Ávila-Souza ");
    expect(control.value).toBe("Ana D'Ávila-Souza ");
  });

  it('charset="digits" aceita só dígitos e abre o teclado numérico', async () => {
    const { input, control } = await setup('digits');

    expect(input.getAttribute('inputmode')).toBe('numeric');
    typeInto(input, '12a-3');

    expect(control.value).toBe('123');
  });

  it('sem charset aceita qualquer caractere', async () => {
    const { input, control } = await setup();

    expect(input.hasAttribute('inputmode')).toBe(false);
    typeInto(input, 'Sala 3 #2');

    expect(control.value).toBe('Sala 3 #2');
  });

  it('aplica a máscara durante a digitação', async () => {
    const { input, control } = await setup('any', MASKS.cpf);

    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(input.getAttribute('maxlength')).toBe('14');
    typeInto(input, '52998224725');

    expect(input.value).toBe('529.982.247-25');
    expect(control.value).toBe('529.982.247-25');
  });

  it('troca de máscara de telefone fixo para celular', async () => {
    const { input } = await setup('any', MASKS.phone);

    typeInto(input, '6132345678');
    expect(input.value).toBe('(61) 3234-5678');
    typeInto(input, '61912345678');
    expect(input.value).toBe('(61) 91234-5678');
  });

  it('exibe formatado um valor sem máscara definido pelo código', async () => {
    const { fixture, input, control } = await setup('any', MASKS.cep);

    control.setValue('70040010');
    await fixture.whenStable();

    expect(input.value).toBe('70040-010');
  });

  it('reflete valores definidos pelo código (patchValue)', async () => {
    const { fixture, input, control } = await setup();

    control.setValue('Valor inicial');
    await fixture.whenStable();

    expect(input.value).toBe('Valor inicial');
  });
});
