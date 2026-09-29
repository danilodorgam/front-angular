import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LANDMARK_IDS } from '../../accessibility/accessibility-bar/accessibility-bar';
import { TranslatePipe } from '../../localization/translate.pipe';
import { LAYOUT_SESSION } from '../layout-session';
import { LayoutService } from '../layout.service';
import { NAVIGATION_ITEMS } from '../navigation';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      [id]="menuId"
      class="sidebar"
      tabindex="-1"
      [hidden]="!layout.menuOpen()"
      [attr.aria-label]="'common.menu.label' | translate"
    >
      <ul class="sidebar__list">
        @for (item of items(); track item.path) {
          <li>
            <a
              class="sidebar__link"
              [routerLink]="item.path"
              routerLinkActive="sidebar__link--active"
              ariaCurrentWhenActive="page"
              [routerLinkActiveOptions]="{ exact: true }"
            >
              {{ item.labelKey | translate }}
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  protected readonly layout = inject(LayoutService);
  protected readonly menuId = LANDMARK_IDS.menu;
  private readonly session = inject(LAYOUT_SESSION);
  private readonly allItems = inject(NAVIGATION_ITEMS);

  protected readonly items = computed(() => {
    const authenticated = this.session.userName() !== null;
    return this.allItems.filter((item) => !item.requiresAuth || authenticated);
  });
}
