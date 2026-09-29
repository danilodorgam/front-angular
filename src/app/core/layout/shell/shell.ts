import { ChangeDetectionStrategy, Component, Injector, afterNextRender, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, skip } from 'rxjs';
import { AccessibilityBar, LANDMARK_IDS } from '../../accessibility/accessibility-bar/accessibility-bar';
import { focusElementById } from '../../accessibility/focus';
import { NotificationOutlet } from '../../error-handling/notification-outlet/notification-outlet';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { LayoutService } from '../layout.service';
import { Sidebar } from '../sidebar/sidebar';

/** Estrutura padrão: barra de acessibilidade, cabeçalho, menu lateral, conteúdo e rodapé. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, AccessibilityBar, Header, Sidebar, Footer, NotificationOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly layout = inject(LayoutService);
  protected readonly contentId = LANDMARK_IDS.content;
  private readonly injector = inject(Injector);

  constructor() {
    // Em SPA o foco fica "perdido" após navegar; leva o foco ao conteúdo principal.
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.layout.closeMenuOnSmallScreens();
        afterNextRender(() => focusElementById(this.contentId), { injector: this.injector });
      });
  }
}
