import { decimalSeparatorFor, formatNumeric, parseNumeric, sanitizeNumeric } from './numeric';

describe('numeric helpers', () => {
  describe('sanitizeNumeric', () => {
    it('remove tudo que não for dígito', () => {
      expect(sanitizeNumeric('12a3-b4 e5', false)).toBe('12345');
    });

    it('descarta separadores quando decimais não são permitidos', () => {
      expect(sanitizeNumeric('12,50', false)).toBe('1250');
    });

    it('mantém apenas o primeiro separador decimal', () => {
      expect(sanitizeNumeric('1,2.3,4', true)).toBe('1,234');
      expect(sanitizeNumeric('R$ 12.50', true)).toBe('12.50');
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
    });
  });

  describe('formatNumeric', () => {
    it('usa o separador decimal informado', () => {
      expect(formatNumeric(12.5, ',')).toBe('12,5');
      expect(formatNumeric(12.5, '.')).toBe('12.5');
      expect(formatNumeric(null, ',')).toBe('');
    });
  });

  it('descobre o separador decimal do idioma', () => {
    expect(decimalSeparatorFor('pt-BR')).toBe(',');
    expect(decimalSeparatorFor('en')).toBe('.');
  });
});
