import { TestBed } from '@angular/core/testing';
import { provideTestEnvironment } from '@testing/test-helpers';
import { TRANSLATION_LOADER, TranslationLoader } from './translation-loader';
import { TranslationService } from './translation.service';
import { TranslationCatalog } from './translation.types';

describe('TranslationService', () => {
  let loader: ReturnType<typeof vi.fn<TranslationLoader>>;
  let service: TranslationService;

  beforeEach(() => {
    localStorage.clear();
    const catalogs: Record<string, TranslationCatalog> = {
      'pt-BR': { greeting: { hello: 'Olá, {{name}}!', plain: 'Bem-vindo' } },
      en: { greeting: { hello: 'Hello, {{name}}!' } },
    };
    loader = vi.fn<TranslationLoader>(async (language) => catalogs[language]);
    TestBed.configureTestingModule({
      providers: [provideTestEnvironment(), { provide: TRANSLATION_LOADER, useValue: loader }],
    });
    service = TestBed.inject(TranslationService);
  });

  it('traduz chaves aninhadas e interpola parâmetros', async () => {
    await service.use('pt-BR');

    expect(service.translate('greeting.plain')).toBe('Bem-vindo');
    expect(service.translate('greeting.hello', { name: 'Ana' })).toBe('Olá, Ana!');
  });

  it('mantém o placeholder quando o parâmetro não é informado', async () => {
    await service.use('pt-BR');

    expect(service.translate('greeting.hello')).toBe('Olá, {{name}}!');
  });

  it('retorna a própria chave quando a tradução não existe', async () => {
    await service.use('pt-BR');

    expect(service.translate('nao.existe')).toBe('nao.existe');
    expect(service.translate('greeting')).toBe('greeting');
  });

  it('troca de idioma, atualiza o atributo lang do <html> e salva a preferência', async () => {
    await service.use('en');

    expect(service.language()).toBe('en');
    expect(service.translate('greeting.hello', { name: 'Ana' })).toBe('Hello, Ana!');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('app.language')).toBe('en');
  });

  it('carrega cada catálogo uma única vez', async () => {
    await service.use('en');
    await service.use('pt-BR');
    await service.use('en');

    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('inicia com o idioma salvo pelo usuário', async () => {
    localStorage.setItem('app.language', 'en');

    await service.init();

    expect(service.language()).toBe('en');
  });

  it('ignora preferência salva inválida', async () => {
    localStorage.setItem('app.language', 'xx-YY');

    await service.init();

    expect(['pt-BR', 'en']).toContain(service.language());
  });
});
