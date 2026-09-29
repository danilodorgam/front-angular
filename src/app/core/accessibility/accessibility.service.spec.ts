import { TestBed } from '@angular/core/testing';
import { AccessibilityService, FONT_SCALE, HIGH_CONTRAST_CLASS } from './accessibility.service';

describe('AccessibilityService', () => {
  const root = document.documentElement;

  beforeEach(() => {
    localStorage.clear();
    root.classList.remove(HIGH_CONTRAST_CLASS);
    root.style.removeProperty('--font-scale');
  });

  it('alterna o alto contraste no <html> e salva a preferência', () => {
    const service = TestBed.inject(AccessibilityService);

    service.toggleHighContrast();

    expect(service.highContrast()).toBe(true);
    expect(root.classList).toContain(HIGH_CONTRAST_CLASS);
    expect(localStorage.getItem('app.a11y.highContrast')).toBe('true');

    service.toggleHighContrast();
    expect(root.classList).not.toContain(HIGH_CONTRAST_CLASS);
  });

  it('aumenta e diminui a fonte respeitando os limites', () => {
    const service = TestBed.inject(AccessibilityService);

    for (let i = 0; i < 10; i++) {
      service.increaseFont();
    }
    expect(service.fontScale()).toBe(FONT_SCALE.max);
    expect(service.canIncreaseFont()).toBe(false);
    expect(root.style.getPropertyValue('--font-scale')).toBe(String(FONT_SCALE.max));

    for (let i = 0; i < 10; i++) {
      service.decreaseFont();
    }
    expect(service.fontScale()).toBe(FONT_SCALE.min);
    expect(service.canDecreaseFont()).toBe(false);

    service.resetFont();
    expect(service.fontScale()).toBe(FONT_SCALE.default);
  });

  it('restaura as preferências salvas ao iniciar', () => {
    localStorage.setItem('app.a11y.highContrast', 'true');
    localStorage.setItem('app.a11y.fontScale', '1.25');

    const service = TestBed.inject(AccessibilityService);

    expect(service.highContrast()).toBe(true);
    expect(service.fontScale()).toBe(1.25);
    expect(root.classList).toContain(HIGH_CONTRAST_CLASS);
  });

  it('ignora valores inválidos no armazenamento', () => {
    localStorage.setItem('app.a11y.fontScale', 'gigante');

    expect(TestBed.inject(AccessibilityService).fontScale()).toBe(FONT_SCALE.default);
  });
});
