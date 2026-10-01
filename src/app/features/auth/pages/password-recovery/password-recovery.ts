import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TranslatePipe } from '@core/localization/translate.pipe';
import { EmailField, FormErrorSummary } from '@shared/forms';
import { AppValidators } from '@shared/validation/validators/app-validators';
import { AuthService } from '../../data-access/auth.service';

@Component({
  selector: 'app-password-recovery',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, EmailField, FormErrorSummary],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './password-recovery.html',
})
export class PasswordRecovery {
  private readonly auth = inject(AuthService);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, AppValidators.email]],
  });

  protected readonly submitAttempt = signal(0);
  protected readonly submitting = signal(false);
  protected readonly sent = signal(false);

  protected submit(): void {
    this.submitAttempt.update((n) => n + 1);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.auth
      .requestPasswordRecovery(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      // Mesma resposta exista ou não o e-mail, para não revelar quem tem cadastro.
      .subscribe({ next: () => this.sent.set(true) });
  }
}
