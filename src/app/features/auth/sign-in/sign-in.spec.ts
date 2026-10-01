import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { loadTranslations, provideTestEnvironment, typeInto } from '@testing/test-helpers';
import { toAppError } from '@core/error-handling/http-error.mapper';
import { AuthService } from '../data-access/auth.service';
import { SignIn } from './sign-in';

describe('SignIn', () => {
  const signIn = vi.fn();

  async function setup(returnUrl?: string) {
    signIn.mockReset();
    TestBed.configureTestingModule({
      providers: [provideTestEnvironment(), provideRouter([]), { provide: AuthService, useValue: { signIn } }],
    });
    await loadTranslations();
    const fixture = TestBed.createComponent(SignIn);
    if (returnUrl) {
      fixture.componentRef.setInput('returnUrl', returnUrl);
    }
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const submit = async () => {
      root.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    const fill = (email: string, password: string) => {
      typeInto(root.querySelector('#sign-in-email') as HTMLInputElement, email);
      typeInto(root.querySelector('#sign-in-password') as HTMLInputElement, password);
    };
    return { fixture, root, navigate, submit, fill };
  }

  it('mostra o resumo de erros e marca os campos ao enviar vazio', async () => {
    const { root, submit } = await setup();

    await submit();

    expect(signIn).not.toHaveBeenCalled();
    expect(root.querySelectorAll('.error-summary li')).toHaveLength(2);
    expect(root.querySelector('#sign-in-email')?.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('#sign-in-password')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('autentica e redireciona para a página de origem', async () => {
    const { fill, submit, navigate } = await setup('/estoque/novo');
    signIn.mockReturnValue(of({ name: 'Maria' }));

    fill('maria@exemplo.gov.br', 'segredo123');
    await submit();

    expect(signIn).toHaveBeenCalledWith({ email: 'maria@exemplo.gov.br', password: 'segredo123' });
    expect(navigate).toHaveBeenCalledWith('/estoque/novo');
  });

  it('ignora returnUrl externo (proteção contra open redirect)', async () => {
    const { fill, submit, navigate } = await setup('//site-malicioso.com');
    signIn.mockReturnValue(of({ name: 'Maria' }));

    fill('maria@exemplo.gov.br', 'segredo123');
    await submit();

    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('exibe mensagem de credenciais inválidas no 401', async () => {
    const { root, fill, submit } = await setup();
    signIn.mockReturnValue(throwError(() => toAppError(new HttpErrorResponse({ status: 401 }))));

    fill('maria@exemplo.gov.br', 'senhaerrada');
    await submit();

    expect(root.querySelector('[role="alert"]')?.textContent).toContain('E-mail ou senha incorretos');
  });
});
