import { decimalSeparatorFor, formatNumeric, parseNumeric, sanitizeNumeric } from './numeric';

describe('numeric helpers', () => {
  describe('sanitizeNumeric', () => {
    it('remove tudo que não for dígito', () => {
      expect(sanitizeNumeric('12a3-b4 e5')).toBe('12345');
    });

    it('descarta separadores quando decimais não são permitidos', () => {
      expect(sanitizeNumeric('12,50')).toBe('1250');
    });

    it('mantém apenas o primeiro separador decimal', () => {
      expect(sanitizeNumeric('1,2.3,4', { allowDecimal: true })).toBe('1,234');
      expect(sanitizeNumeric('R$ 12.50', { allowDecimal: true })).toBe('12.50');
    });

    it('aceita o sinal de menos só no início e só quando permitido', () => {
      expect(sanitizeNumeric('-12')).toBe('12');
      expect(sanitizeNumeric('-12', { allowNegative: true })).toBe('-12');
      expect(sanitizeNumeric('1-2', { allowNegative: true })).toBe('12');
      expect(sanitizeNumeric('--3', { allowNegative: true })).toBe('-3');
    });

    it('limita as casas decimais', () => {
      expect(sanitizeNumeric('12,3456', { allowDecimal: true, decimalPlaces: 2 })).toBe('12,34');
      expect(sanitizeNumeric('12,5', { allowDecimal: true, decimalPlaces: 0 })).toBe('125');
    });
  });

  describe('parseNumeric', () => {
    it('converte vírgula ou ponto em número', () => {
      expect(parseNumeric('12,5')).toBe(12.5);
      expect(parseNumeric('12.5')).toBe(12.5);
      expect(parseNumeric('7')).toBe(7);
    });

    it('retorna null para texto vazio ou incompleto', () => {
      expect(parseNumeric('')).toBeNull();
      expect(parseNumeric(',')).toBeNull();
      expect(parseNumeric('-')).toBeNull();
    });

    it('converte negativos', () => {
      expect(parseNumeric('-3,5')).toBe(-3.5);
    });
  });

  describe('formatNumeric', () => {
    it('usa o separador decimal informado', () => {
      expect(formatNumeric(12.5, ',')).toBe('12,5');
      expect(formatNumeric(12.5, '.')).toBe('12.5');
      expect(formatNumeric(null, ',')).toBe('');
    });

    it('fixa as casas decimais quando informado', () => {
      expect(formatNumeric(12.5, ',', 2)).toBe('12,50');
      expect(formatNumeric(3, '.', 2)).toBe('3.00');
    });
  });

  it('descobre o separador decimal do idioma', () => {
    expect(decimalSeparatorFor('pt-BR')).toBe(',');
    expect(decimalSeparatorFor('en')).toBe('.');
  });
});
