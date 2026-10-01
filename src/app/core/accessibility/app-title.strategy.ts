import { Injectable, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslationService } from '@core/localization/translation.service';
import { LiveAnnouncer } from './live-announcer.service';

/**
 * e-MAG 3.2 – títulos descritivos: cada rota declara `title` com uma chave de tradução
 * e o <title> vira "Título da página | Nome do sistema".
 * Em navegações seguintes, o novo título é anunciado para leitores de tela.
 */
@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly translation = inject(TranslationService);
  private readonly announcer = inject(LiveAnnouncer);

  private readonly pageKey = signal<string | undefined>(undefined);
  private initialNavigation = true;

  constructor() {
    super();
    // Reaplica o título quando o idioma muda.
    effect(() => this.title.setTitle(this.compose(this.pageKey())));
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    this.pageKey.set(key);
    this.title.setTitle(this.compose(key));

    if (!this.initialNavigation) {
      const page = key ? this.translation.translate(key) : this.translation.translate('common.appName');
      this.announcer.announce(this.translation.translate('accessibility.routeChanged', { title: page }));
    }
    this.initialNavigation = false;
  }

  private compose(key: string | undefined): string {
    const appName = this.translation.translate('common.appName');
    return key ? `${this.translation.translate(key)} | ${appName}` : appName;
  }
}
