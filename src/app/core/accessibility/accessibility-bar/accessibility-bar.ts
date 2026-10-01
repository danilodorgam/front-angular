import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  afterNextRender,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LayoutService } from '@core/layout/layout.service';
import { TranslatePipe } from '@core/localization/translate.pipe';
import { AccessibilityService } from '../accessibility.service';
import { focusElementById } from '../focus';

export const LANDMARK_IDS = { content: 'conteudo', menu: 'menu', footer: 'rodape' } as const;

/**
 * Barra de acessibilidade no padrão e-MAG: primeiro elemento da página, com
 * atalhos (accesskey) para conteúdo [1], menu [2] e rodapé [4], além de
 * alto contraste e ajuste de fonte.
 */
@Component({
  selector: 'app-accessibility-bar',
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accessibility-bar.html',
  styleUrl: './accessibility-bar.scss',
})
export class AccessibilityBar {
  protected readonly a11y = inject(AccessibilityService);
  protected readonly ids = LANDMARK_IDS;
  private readonly layout = inject(LayoutService);
  private readonly injector = inject(Injector);

  protected skipTo(event: Event, targetId: string): void {
    event.preventDefault();
    if (targetId === LANDMARK_IDS.menu && !this.layout.menuOpen()) {
      this.layout.openMenu();
      afterNextRender(() => focusElementById(targetId), { injector: this.injector });
      return;
    }
    focusElementById(targetId);
  }
}
