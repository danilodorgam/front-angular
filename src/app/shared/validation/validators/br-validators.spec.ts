import { FormControl } from '@angular/forms';
import { BrValidators } from './br-validators';

const check = (validator: (typeof BrValidators)[keyof typeof BrValidators], value: unknown) =>
  validator(new FormControl(value));

describe('BrValidators', () => {
  it('ignoram campo vazio (responsabilidade do required)', () => {
    for (const validator of Object.values(BrValidators)) {
      expect(check(validator, '')).toBeNull();
      expect(check(validator, null)).toBeNull();
    }
  });

  describe('cpf', () => {
    it.each(['529.982.247-25', '52998224725', '123.456.789-09'])('aceita %s', (value) => {
      expect(check(BrValidators.cpf, value)).toBeNull();
    });

    it.each(['529.982.247-24', '111.111.111-11', '5299822472', '529.982.247-2a', '529 982 247 25'])(
      'rejeita %s',
      (value) => {
        expect(check(BrValidators.cpf, value)).toEqual({ cpf: true });
      },
    );
  });

  describe('cnpj', () => {
    it.each(['11.222.333/0001-81', '11222333000181', '12.ABC.345/01DE-35', '12abc34501de35'])(
      'aceita %s',
      (value) => {
        expect(check(BrValidators.cnpj, value)).toBeNull();
      },
    );

    it.each([
      '11.222.333/0001-80',
      '00.000.000/0000-00',
      '12.ABC.345/01DE-36',
      '12.ABC.345/01DE-3A',
    ])('rejeita %s', (value) => {
      expect(check(BrValidators.cnpj, value)).toEqual({ cnpj: true });
    });
  });

  describe('cep', () => {
    it.each(['70040-010', '70040010'])('aceita %s', (value) => {
      expect(check(BrValidators.cep, value)).toBeNull();
    });

    it.each(['7004-0010', '7004001', '70040-01a'])('rejeita %s', (value) => {
      expect(check(BrValidators.cep, value)).toEqual({ cep: true });
    });
  });

  describe('phone', () => {
    it.each(['(61) 91234-5678', '61912345678', '(61) 3234-5678', '6132345678'])(
      'aceita %s',
      (value) => {
        expect(check(BrValidators.phone, value)).toBeNull();
      },
    );

    it.each([
      '(61) 81234-5678', // celular sem o 9 na frente
      '(61) 1234-5678', // fixo começando com 1
      '(01) 91234-5678', // DDD inválido
      '61 9123-456',
      '+55 61 91234-5678',
    ])('rejeita %s', (value) => {
      expect(check(BrValidators.phone, value)).toEqual({ phone: true });
    });
  });

  describe('date', () => {
    it.each(['01/10/2026', '29/02/2024', '01102026'])('aceita %s', (value) => {
      expect(check(BrValidators.date, value)).toBeNull();
    });

    it.each(['31/04/2026', '29/02/2026', '00/01/2026', '1/10/2026', '2026-10-01'])(
      'rejeita %s',
      (value) => {
        expect(check(BrValidators.date, value)).toEqual({ date: true });
      },
    );
  });
});
