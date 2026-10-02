import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageSwitcher } from '@core/localization/language-switcher/language-switcher';
import { TranslatePipe } from '@core/localization/translate.pipe';
import { LAYOUT_SESSION } from '../layout-session';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslatePipe, LanguageSwitcher],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly layout = inject(LayoutService);
  protected readonly session = inject(LAYOUT_SESSION);
}
