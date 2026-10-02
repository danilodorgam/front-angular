import { NavigationItem } from '@core/layout/navigation';

/** Itens do menu lateral. `labelKey` é uma chave de tradução. */
export const APP_NAVIGATION: readonly NavigationItem[] = [
  { labelKey: 'common.menu.inventory', path: '/estoque', requiresAuth: true },
  { labelKey: 'common.menu.newItem', path: '/estoque/novo', requiresAuth: true },
  { labelKey: 'common.menu.accessibility', path: '/acessibilidade' },
];
