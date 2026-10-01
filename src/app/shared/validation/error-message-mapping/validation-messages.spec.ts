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

  it('usa mensagem genérica para validadores desconhecidos', () => {
    expect(mapValidationError({ cpf: true })?.key).toBe('validation.invalid');
  });
});

describe('translateValidationError', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideTestEnvironment()] }));

  it('monta a mensagem com o nome do campo traduzido', async () => {
    const translation = await loadTranslations('pt-BR');

    expect(translateValidationError(translation, { required: true }, 'estoque.fields.name')).toBe(
      'Preencha o campo Nome.',
    );
    expect(translateValidationError(translation, { min: { min: 0, actual: -1 } }, 'estoque.fields.quantity')).toBe(
      'O campo Quantidade deve ser maior ou igual a 0.',
    );
  });

  it('traduz mensagens do servidor enviadas como chave', async () => {
    const translation = await loadTranslations('en');

    expect(translateValidationError(translation, { server: 'estoque.errors.skuTaken' }, 'estoque.fields.sku')).toBe(
      'An item with this code already exists.',
    );
  });
});
