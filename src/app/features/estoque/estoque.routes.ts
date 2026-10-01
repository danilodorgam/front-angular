import { Routes } from '@angular/router';

/** Rotas carregadas sob demanda em `/estoque` (protegidas por `authGuard` em app.routes). */
export const ESTOQUE_ROUTES: Routes = [
  {
    path: '',
    title: 'estoque.list.title',
    loadComponent: () =>
      import('./pages/inventory-list/inventory-list').then((m) => m.InventoryList),
  },
  {
    path: 'novo',
    title: 'estoque.edit.titleNew',
    loadComponent: () => import('./pages/item-edit/item-edit').then((m) => m.ItemEdit),
  },
  {
    path: ':id',
    title: 'estoque.detail.title',
    loadComponent: () => import('./pages/item-detail/item-detail').then((m) => m.ItemDetail),
  },
  {
    path: ':id/editar',
    title: 'estoque.edit.titleEdit',
    loadComponent: () => import('./pages/item-edit/item-edit').then((m) => m.ItemEdit),
  },
];
