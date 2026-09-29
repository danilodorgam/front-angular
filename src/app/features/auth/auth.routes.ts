import { Routes } from '@angular/router';
import { guestGuard } from './data-access/auth.guard';

/** Rotas carregadas sob demanda em `/auth`. `title` é uma chave de tradução. */
export const AUTH_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'entrar' },
  {
    path: 'entrar',
    title: 'auth.signIn.title',
    canActivate: [guestGuard],
    loadComponent: () => import('./sign-in/sign-in').then((m) => m.SignIn),
  },
  {
    path: 'recuperar-senha',
    title: 'auth.passwordRecovery.title',
    loadComponent: () => import('./password-recovery/password-recovery').then((m) => m.PasswordRecovery),
  },
];
