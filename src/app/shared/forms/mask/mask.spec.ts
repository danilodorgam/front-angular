import { applyMask, caretAfter, maskAcceptsLetters, maskMaxLength, MASKS, unmask } from './mask';

describe('mask', () => {
  describe('applyMask', () => {
    it('formata conforme o padrão', () => {
      expect(applyMask('52998224725', MASKS.cpf)).toBe('529.982.247-25');
      expect(applyMask('70040010', MASKS.cep)).toBe('70040-010');
      expect(applyMask('01102026', MASKS.date)).toBe('01/10/2026');
    });

    it('formata enquanto o valor ainda está incompleto, sem separador solto no fim', () => {
      expect(applyMask('529', MASKS.cpf)).toBe('529');
      expect(applyMask('5299', MASKS.cpf)).toBe('529.9');
      expect(applyMask('', MASKS.cpf)).toBe('');
    });

    it('descarta o que não cabe no marcador e o excesso', () => {
      expect(applyMask('529a982', MASKS.cpf)).toBe('529.982');
      expect(applyMask('529.982.247-25999', MASKS.cpf)).toBe('529.982.247-25');
    });

    it('escolhe o padrão pelo tamanho (telefone fixo ou celular)', () => {
      expect(applyMask('6132345678', MASKS.phone)).toBe('(61) 3234-5678');
      expect(applyMask('61912345678', MASKS.phone)).toBe('(61) 91234-5678');
    });

    it('aceita o CNPJ alfanumérico em maiúsculas', () => {
      expect(applyMask('12abc34501de35', MASKS.cnpj)).toBe('12.ABC.345/01DE-35');
      expect(applyMask('11222333000181', MASKS.cnpj)).toBe('11.222.333/0001-81');
    });
  });

  it('unmask remove a formatação', () => {
    expect(unmask('529.982.247-25')).toBe('52998224725');
    expect(unmask('12.abc.345/01de-35')).toBe('12ABC34501DE35');
  });

  it('caretAfter posiciona o cursor depois do n-ésimo caractere digitado', () => {
    expect(caretAfter('529.982', 3)).toBe(3);
    expect(caretAfter('529.982', 4)).toBe(5);
    expect(caretAfter('(61) 9', 0)).toBe(0);
    expect(caretAfter('(61) 9', 3)).toBe(6);
  });

  it('informa o tamanho máximo e se a máscara aceita letras', () => {
    expect(maskMaxLength(MASKS.phone)).toBe(15);
    expect(maskAcceptsLetters(MASKS.cnpj)).toBe(true);
    expect(maskAcceptsLetters(MASKS.cpf)).toBe(false);
  });
});
