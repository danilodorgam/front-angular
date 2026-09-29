import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, SIGN_IN_PATH } from './auth.service';

/** Exige usuário autenticado; caso contrário, envia para o login guardando o destino. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) {
    return true;
  }
  return inject(Router).createUrlTree([SIGN_IN_PATH], { queryParams: { returnUrl: state.url } });
};

/** Impede que um usuário já autenticado veja a tela de login. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? inject(Router).createUrlTree(['/']) : true;
};
