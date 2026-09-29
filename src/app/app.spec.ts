import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { loadTranslations, provideTestEnvironment } from '../testing/test-helpers';
import { App } from './app';

describe('App', () => {
  async function setup() {
    TestBed.configureTestingModule({ providers: [provideTestEnvironment(), provideRouter([])] });
    await loadTranslations();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renderiza o layout padrão com as regiões principais', async () => {
    const root = await setup();

    expect(root.querySelector('header')).not.toBeNull();
    expect(root.querySelector('nav#menu')).not.toBeNull();
    expect(root.querySelector('main#conteudo')).not.toBeNull();
    expect(root.querySelector('footer#rodape')).not.toBeNull();
  });

  it('a barra de acessibilidade é o primeiro bloco e tem os atalhos do e-MAG', async () => {
    const root = await setup();

    const firstLink = root.querySelector('a') as HTMLAnchorElement;
    expect(firstLink.getAttribute('accesskey')).toBe('1');
    expect(firstLink.textContent).toContain('Ir para o conteúdo');
    const keys = Array.from(root.querySelectorAll('.a11y-bar a[accesskey]')).map((a) => a.getAttribute('accesskey'));
    expect(keys).toEqual(['1', '2', '4']);
  });

  it('o atalho "Ir para o conteúdo" move o foco para o <main>', async () => {
    const root = await setup();

    (root.querySelector('a[accesskey="1"]') as HTMLAnchorElement).click();

    expect(document.activeElement?.id).toBe('conteudo');
  });
});
