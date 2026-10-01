import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { isAppError } from '@core/error-handling/app-error';
import { TranslatePipe } from '@core/localization/translate.pipe';
import { EmailField, FormErrorSummary, SummaryField, TextField } from '@shared/forms';
import { AppValidators } from '@shared/validation/validators/app-validators';
import { AuthService } from '../../data-access/auth.service';

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, EmailField, TextField, FormErrorSummary],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sign-in.html',
})
export class SignIn {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Query param `?returnUrl=` (vinculado por `withComponentInputBinding`). */
  readonly returnUrl = input<string>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, AppValidators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly fields: readonly SummaryField[] = [
    { name: 'email', inputId: 'sign-in-email', label: 'auth.signIn.email' },
    { name: 'password', inputId: 'sign-in-password', label: 'auth.signIn.password' },
  ];

  protected readonly submitAttempt = signal(0);
  protected readonly submitting = signal(false);
  protected readonly errorKey = signal<string | null>(null);

  protected submit(): void {
    this.errorKey.set(null);
    this.submitAttempt.update((n) => n + 1);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.auth
      .signIn(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl(this.safeReturnUrl()),
        error: (error: unknown) => {
          if (isAppError(error) && error.kind === 'unauthorized') {
            this.errorKey.set('auth.signIn.invalidCredentials');
          }
        },
      });
  }

  /** Aceita apenas caminhos internos, evitando redirecionamento aberto (open redirect). */
  private safeReturnUrl(): string {
    const url = this.returnUrl();
    return url && url.startsWith('/') && !url.startsWith('//') ? url : '/';
  }
}
