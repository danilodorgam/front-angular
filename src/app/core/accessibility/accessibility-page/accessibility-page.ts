import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@core/localization/translate.pipe';

/** e-MAG: página que descreve os recursos de acessibilidade disponíveis. */
@Component({
  selector: 'app-accessibility-page',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="prose">
      <h1>{{ 'accessibility.page.title' | translate }}</h1>
      <p>{{ 'accessibility.page.intro' | translate }}</p>

      <h2>{{ 'accessibility.page.shortcutsTitle' | translate }}</h2>
      <p>{{ 'accessibility.page.shortcutsIntro' | translate }}</p>
      <ul>
        <li>{{ 'accessibility.page.shortcutContent' | translate }}</li>
        <li>{{ 'accessibility.page.shortcutMenu' | translate }}</li>
        <li>{{ 'accessibility.page.shortcutFooter' | translate }}</li>
      </ul>
      <p>{{ 'accessibility.page.shortcutBrowsers' | translate }}</p>

      <h2>{{ 'accessibility.page.contrastTitle' | translate }}</h2>
      <p>{{ 'accessibility.page.contrastText' | translate }}</p>

      <h2>{{ 'accessibility.page.fontTitle' | translate }}</h2>
      <p>{{ 'accessibility.page.fontText' | translate }}</p>

      <h2>{{ 'accessibility.page.formsTitle' | translate }}</h2>
      <p>{{ 'accessibility.page.formsText' | translate }}</p>

      <h2>{{ 'accessibility.page.readersTitle' | translate }}</h2>
      <p>{{ 'accessibility.page.readersText' | translate }}</p>

      <p>
        <a href="https://emag.governoeletronico.gov.br/">{{
          'accessibility.page.moreInfo' | translate
        }}</a>
      </p>
    </article>
  `,
})
export class AccessibilityPage {}
