import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy } from '@angular/router';
import { loadTranslations, provideTestEnvironment } from '@testing/test-helpers';
import { AppTitleStrategy } from './app-title.strategy';
import { LiveAnnouncer } from './live-announcer.service';

@Component({ template: '' })
class Blank {}

describe('AppTitleStrategy', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideTestEnvironment(),
        provideRouter([
          { path: 'estoque', title: 'estoque.list.title', component: Blank },
          { path: 'acessibilidade', title: 'accessibility.page.title', component: Blank },
        ]),
        { provide: TitleStrategy, useExisting: AppTitleStrategy },
      ],
    });
  });

  it('traduz o título da rota e acrescenta o nome do sistema', async () => {
    await loadTranslations('pt-BR');

    await TestBed.inject(Router).navigateByUrl('/estoque');

    expect(TestBed.inject(Title).getTitle()).toBe('Itens em estoque | Controle de Estoque');
  });

  it('anuncia a nova página para leitores de tela a partir da segunda navegação', async () => {
    await loadTranslations('pt-BR');
    const announce = vi.spyOn(TestBed.inject(LiveAnnouncer), 'announce');
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/estoque');
    expect(announce).not.toHaveBeenCalled();

    await router.navigateByUrl('/acessibilidade');
    expect(announce).toHaveBeenCalledWith('Página carregada: Acessibilidade');
  });

  it('atualiza o título quando o idioma muda', async () => {
    const translation = await loadTranslations('pt-BR');
    await TestBed.inject(Router).navigateByUrl('/estoque');

    await translation.use('en');
    TestBed.tick();

    expect(TestBed.inject(Title).getTitle()).toBe('Inventory items | Inventory Control');
  });
});
