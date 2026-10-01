import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { readStorage, writeStorage } from '@shared/utils/safe-storage';

const CONTRAST_KEY = 'app.a11y.highContrast';
const FONT_SCALE_KEY = 'app.a11y.fontScale';
export const HIGH_CONTRAST_CLASS = 'high-contrast';

export const FONT_SCALE = { min: 0.875, max: 1.5, step: 0.125, default: 1 } as const;

/**
 * Preferências visuais recomendadas pelo e-MAG (seção 4 – Apresentação/Design):
 * alto contraste e redimensionamento de texto sem perda de conteúdo.
 * Os valores ficam salvos no navegador e são aplicados no elemento <html>.
 */
@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  private readonly root = inject(DOCUMENT).documentElement;

  private readonly contrast = signal(readStorage(CONTRAST_KEY) === 'true');
  private readonly scale = signal(clampScale(Number(readStorage(FONT_SCALE_KEY) ?? FONT_SCALE.default)));

  readonly highContrast = this.contrast.asReadonly();
  readonly fontScale = this.scale.asReadonly();
  readonly canIncreaseFont = computed(() => this.scale() < FONT_SCALE.max);
  readonly canDecreaseFont = computed(() => this.scale() > FONT_SCALE.min);

  constructor() {
    this.apply();
  }

  toggleHighContrast(): void {
    this.contrast.update((value) => !value);
    this.apply();
  }

  increaseFont(): void {
    this.setFontScale(this.scale() + FONT_SCALE.step);
  }

  decreaseFont(): void {
    this.setFontScale(this.scale() - FONT_SCALE.step);
  }

  resetFont(): void {
    this.setFontScale(FONT_SCALE.default);
  }

  private setFontScale(value: number): void {
    this.scale.set(clampScale(value));
    this.apply();
  }

  private apply(): void {
    this.root.classList.toggle(HIGH_CONTRAST_CLASS, this.contrast());
    this.root.style.setProperty('--font-scale', String(this.scale()));
    writeStorage(CONTRAST_KEY, String(this.contrast()));
    writeStorage(FONT_SCALE_KEY, String(this.scale()));
  }
}

function clampScale(value: number): number {
  if (!Number.isFinite(value)) {
    return FONT_SCALE.default;
  }
  return Math.min(FONT_SCALE.max, Math.max(FONT_SCALE.min, value));
}
