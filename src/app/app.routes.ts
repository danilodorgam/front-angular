import { Routes } from '@angular/router';
import { ErrorPage } from '@core/error-handling/error-page/error-page';
import { authGuard } from '@features/auth/data-access/auth.guard';

/**
 * Rotas de primeiro nível. As features são carregadas sob demanda (lazy loading).
 * `title` recebe uma chave de tradução, resolvida pelo `AppTitleStrategy`.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'estoque' },
  {
    path: 'auth',
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'estoque',
    canActivate: [authGuard],
    loadChildren: () => import('@features/estoque/estoque.routes').then((m) => m.ESTOQUE_ROUTES),
  },
  {
    path: 'acessibilidade',
    title: 'accessibility.page.title',
    loadComponent: () =>
      import('@core/accessibility/accessibility-page/accessibility-page').then((m) => m.AccessibilityPage),
  },
  {
    path: 'acesso-negado',
    title: 'errors.pages.forbidden.title',
    component: ErrorPage,
    data: { code: 403, titleKey: 'errors.pages.forbidden.title', messageKey: 'errors.pages.forbidden.message' },
  },
  {
    path: 'erro',
    title: 'errors.pages.server.title',
    component: ErrorPage,
    data: { code: 500, titleKey: 'errors.pages.server.title', messageKey: 'errors.pages.server.message' },
  },
  {
    path: '**',
    title: 'errors.pages.notFound.title',
    component: ErrorPage,
  },
];
