import { DOCUMENT, Injectable, inject, signal } from '@angular/core';

const DESKTOP_QUERY = '(min-width: 64em)';

/** Estado visual compartilhado do layout (menu lateral aberto/fechado). */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly open = signal(this.isDesktop());

  readonly menuOpen = this.open.asReadonly();

  toggleMenu(): void {
    this.open.update((value) => !value);
  }

  openMenu(): void {
    this.open.set(true);
  }

  closeMenu(): void {
    this.open.set(false);
  }

  /** Em telas pequenas o menu cobre o conteúdo, então fecha após navegar. */
  closeMenuOnSmallScreens(): void {
    if (!this.isDesktop()) {
      this.closeMenu();
    }
  }

  isDesktop(): boolean {
    return this.window?.matchMedia?.(DESKTOP_QUERY).matches ?? true;
  }
}
