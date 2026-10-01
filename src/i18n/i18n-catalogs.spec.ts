import en from './en';
import ptBR from './pt-BR';

interface Catalog {
  readonly [key: string]: string | Catalog;
}

function flattenKeys(catalog: Catalog, prefix = ''): string[] {
  return Object.entries(catalog).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [path] : flattenKeys(value, path);
  });
}

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((match) => match[1]).sort();
}

function valueAt(catalog: Catalog, path: string): string {
  return path.split('.').reduce<Catalog | string>((node, key) => (node as Catalog)[key], catalog) as string;
}

/** Garante que nenhum idioma fique com textos faltando ou parâmetros diferentes. */
describe('Catálogos de tradução', () => {
  const ptKeys = flattenKeys(ptBR).sort();
  const enKeys = flattenKeys(en).sort();

  it('pt-BR e en possuem exatamente as mesmas chaves', () => {
    expect(enKeys).toEqual(ptKeys);
  });

  it('nenhuma tradução está vazia', () => {
    for (const key of ptKeys) {
      expect(valueAt(ptBR, key).trim(), `pt-BR: ${key}`).not.toBe('');
      expect(valueAt(en, key).trim(), `en: ${key}`).not.toBe('');
    }
  });

  it('os parâmetros {{...}} são os mesmos nos dois idiomas', () => {
    for (const key of ptKeys) {
      expect(placeholders(valueAt(en, key)), key).toEqual(placeholders(valueAt(ptBR, key)));
    }
  });
});
