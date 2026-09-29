import { InjectionToken } from '@angular/core';

export interface NavigationItem {
  /** Chave de tradução do rótulo. */
  readonly labelKey: string;
  readonly path: string;
  /** Oculta o item enquanto não houver usuário autenticado. */
  readonly requiresAuth?: boolean;
}

/** Itens do menu lateral, definidos em `app.navigation.ts`. */
export const NAVIGATION_ITEMS = new InjectionToken<readonly NavigationItem[]>('NAVIGATION_ITEMS', {
  providedIn: 'root',
  factory: () => [],
});
