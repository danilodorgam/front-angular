import { TestBed } from '@angular/core/testing';
import { loadTranslations, provideTestEnvironment } from '@testing/test-helpers';
import { mapValidationError, translateValidationError } from './validation-messages';

describe('mapValidationError', () => {
  it('retorna null quando não há erros', () => {
    expect(mapValidationError(null)).toBeNull();
    expect(mapValidationError({})).toBeNull();
  });

  it('prioriza required sobre os demais erros', () => {
    expect(mapValidationError({ email: true, required: true })?.key).toBe('validation.required');
  });

  it('repassa os parâmetros do validador', () => {
    expect(mapValidationError({ maxlength: { requiredLength: 20, actualLength: 25 } })).toEqual({
      key: 'validation.maxlength',
      params: { requiredLength: 20, actualLength: 25 },
    });
  });

  it('usa a mensagem enviada pelo servidor', () => {
    expect(mapValidationError({ server: 'estoque.errors.skuTaken' })).toEqual({
      key: 'validation.server',
      params: { message: 'estoque.errors.skuTaken' },
    });
  });

  it('escolhe a mensagem de número inteiro ou decimal', () => {
    expect(mapValidationError({ numeric: { allowDecimal: false } })?.key).toBe(
      'validation.numeric.integer',
    );
    expect(mapValidationError({ numeric: { allowDecimal: true } })?.key).toBe(
      'validation.numeric.decimal',
    );
  });

  it('segue a convenção validation.<erro> para validadores fora do mapa', () => {
    expect(mapValidationError({ meuValidador: true })).toEqual({
      key: 'validation.meuValidador',
      params: {},
      fallbackKey: 'validation.invalid',
    });
  });

  it('usa a messageKey enviada pelo validador', () => {
    const errors = { pattern: { requiredPattern: '^a$', messageKey: 'estoque.validation.sku' } };
    expect(mapValidationError(errors)?.key).toBe('estoque.validation.sku');
  });
});

describe('translateValidationError', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideTestEnvironment()] }));

  it('monta a mensagem com o nome do campo traduzido', async () => {
    const translation = await loadTranslations('pt-BR');

    expect(translateValidationError(translation, { required: true }, 'estoque.fields.name')).toBe(
      'Preencha o campo Nome.',
    );
    expect(
      translateValidationError(
        translation,
        { min: { min: 0, actual: -1 } },
        'estoque.fields.quantity',
      ),
    ).toBe('O campo Quantidade deve ser maior ou igual a 0.');
    expect(
      translateValidationError(
        translation,
        { numeric: { allowDecimal: true } },
        'estoque.fields.unitPrice',
      ),
    ).toBe('O campo Preço unitário (R$) aceita somente números, com vírgula para os decimais.');
    expect(
      translateValidationError(
        translation,
        { decimalPlaces: { max: 2, actual: 3 } },
        'estoque.fields.unitPrice',
      ),
    ).toBe('O campo Preço unitário (R$) aceita no máximo 2 casas decimais.');
  });

  it('usa a mensagem genérica quando a chave da convenção não existe', async () => {
    const translation = await loadTranslations('pt-BR');

    expect(
      translateValidationError(translation, { meuValidador: true }, 'estoque.fields.name'),
    ).toBe('O campo Nome é inválido.');
  });

  it('encontra mensagens pela convenção (ex.: letters)', async () => {
    const translation = await loadTranslations('pt-BR');

    expect(translateValidationError(translation, { letters: true }, 'estoque.fields.name')).toBe(
      'O campo Nome aceita somente letras, espaço, apóstrofo e hífen.',
    );
  });

  it('usa a mensagem própria do AppValidators.pattern', async () => {
    const translation = await loadTranslations('pt-BR');
    const errors = { pattern: { requiredPattern: '^a$', messageKey: 'estoque.validation.sku' } };

    expect(translateValidationError(translation, errors, 'estoque.fields.sku')).toBe(
      'O campo Código (SKU) aceita somente letras sem acento, números e hífen.',
    );
  });

  it('traduz mensagens do servidor enviadas como chave', async () => {
    const translation = await loadTranslations('en');

    expect(
      translateValidationError(
        translation,
        { server: 'estoque.errors.skuTaken' },
        'estoque.fields.sku',
      ),
    ).toBe('An item with this code already exists.');
  });
});
