import { FormControl } from '@angular/forms';
import { AppValidators } from './app-validators';

describe('AppValidators', () => {
  describe('email', () => {
    it.each(['maria@exemplo.gov.br', 'joao.silva+estoque@orgao.com', 'a@b.co'])(
      'aceita %s',
      (value) => {
        expect(AppValidators.email(new FormControl(value))).toBeNull();
      },
    );

    it.each([
      'maria',
      'maria@',
      'maria@exemplo',
      '@exemplo.com',
      'maria @exemplo.com',
      'maria@exemplo.c',
    ])('rejeita %s', (value) => {
      expect(AppValidators.email(new FormControl(value))).toEqual({ email: true });
    });

    it('não valida campo vazio (responsabilidade do required)', () => {
      expect(AppValidators.email(new FormControl(''))).toBeNull();
      expect(AppValidators.email(new FormControl(null))).toBeNull();
    });
  });

  describe('notBlank', () => {
    it('rejeita texto composto apenas por espaços', () => {
      expect(AppValidators.notBlank(new FormControl('   '))).toEqual({ notBlank: true });
    });

    it('aceita texto com conteúdo e ignora campo vazio', () => {
      expect(AppValidators.notBlank(new FormControl(' abc '))).toBeNull();
      expect(AppValidators.notBlank(new FormControl(''))).toBeNull();
    });
  });

  describe('numeric', () => {
    const integer = AppValidators.numeric();
    const decimal = AppValidators.numeric({ allowDecimal: true });

    it('aceita inteiros', () => {
      expect(integer(new FormControl(10))).toBeNull();
      expect(integer(new FormControl('42'))).toBeNull();
    });

    it('rejeita decimais quando não permitido', () => {
      expect(integer(new FormControl(1.5))).toEqual({ numeric: { allowDecimal: false } });
      expect(integer(new FormControl('1,5'))).toEqual({ numeric: { allowDecimal: false } });
    });

    it('aceita decimais com vírgula ou ponto quando permitido', () => {
      expect(decimal(new FormControl(1.5))).toBeNull();
      expect(decimal(new FormControl('1,5'))).toBeNull();
      expect(decimal(new FormControl('1.5'))).toBeNull();
    });

    it('valida o limite de casas decimais', () => {
      const money = AppValidators.numeric({ allowDecimal: true, decimalPlaces: 2 });

      expect(money(new FormControl(12.34))).toBeNull();
      expect(money(new FormControl('12,3'))).toBeNull();
      expect(money(new FormControl(12.345))).toEqual({ decimalPlaces: { max: 2, actual: 3 } });
    });

    it('rejeita textos não numéricos', () => {
      expect(decimal(new FormControl('abc'))).toEqual({ numeric: { allowDecimal: true } });
      expect(decimal(new FormControl(Number.NaN))).toEqual({ numeric: { allowDecimal: true } });
    });
  });
});
