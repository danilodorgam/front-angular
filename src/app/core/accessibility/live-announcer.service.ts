import { DOCUMENT, Injectable, inject } from '@angular/core';

export type Politeness = 'polite' | 'assertive';

/**
 * Região `aria-live` visualmente oculta para avisar leitores de tela sobre
 * mudanças que não movem o foco (ex.: navegação entre rotas em uma SPA).
 */
@Injectable({ providedIn: 'root' })
export class LiveAnnouncer {
  private readonly document = inject(DOCUMENT);
  private region: HTMLElement | null = null;
  private pending: ReturnType<typeof setTimeout> | undefined;

  announce(message: string, politeness: Politeness = 'polite'): void {
    const region = this.ensureRegion();
    region.setAttribute('aria-live', politeness);
    region.textContent = '';
    clearTimeout(this.pending);
    // O intervalo garante que o leitor de tela perceba a troca de conteúdo.
    this.pending = setTimeout(() => (region.textContent = message), 100);
  }

  private ensureRegion(): HTMLElement {
    if (!this.region) {
      this.region = this.document.createElement('div');
      this.region.className = 'sr-only';
      this.region.setAttribute('aria-atomic', 'true');
      this.region.dataset['liveAnnouncer'] = '';
      this.document.body.appendChild(this.region);
    }
    return this.region;
  }
}
