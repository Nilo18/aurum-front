import { Component, inject, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService, getAuthErrorMessage, LoginRequest } from '../../../services/auth-service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-verification-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './login-verification-modal.html',
  styleUrl: './login-verification-modal.scss',
})
export class LoginVerificationModal {
  private modal = inject(NgbActiveModal);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  loginInfo!: Omit<LoginRequest, 'otp'>;
  readonly isSubmitting = signal(false);
  readonly submissionError = signal('');
  readonly verificationForm = this.fb.nonNullable.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  get maskedEmail(): string {
    const [name, domain] = (this.loginInfo?.email ?? '').split('@');
    if (!name || !domain) return 'your email address';
    const visible = name.slice(0, Math.min(2, name.length));
    return `${visible}${'•'.repeat(Math.max(3, name.length - visible.length))}@${domain}`;
  }

  close(): void {
    if (!this.isSubmitting()) this.modal.dismiss('close');
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting()) return;
    this.submissionError.set('');
    if (this.verificationForm.invalid) {
      this.verificationForm.markAllAsTouched();
      return;
    }
    if (!this.loginInfo?.transactionKey) {
      this.submissionError.set('Your verification session is missing. Close this dialog and sign in again.');
      return;
    }

    this.isSubmitting.set(true);
    try {
      const response = await this.authService.login({ ...this.loginInfo, ...this.verificationForm.getRawValue() });
      if (!response?.token) throw new Error('Missing login response');
      localStorage.setItem('aurum_token', response.token)
      const navigated = await this.router.navigate(['/staff']);
      if (!navigated) throw new Error('Navigation failed');
      this.modal.close('verified');
    } catch (error) {
      this.submissionError.set(getAuthErrorMessage(error, 'We could not complete sign-in. Check your code and try again.'));
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
