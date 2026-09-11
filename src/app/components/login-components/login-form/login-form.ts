import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, getAuthErrorMessage } from '../../../services/auth-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginVerificationModal } from '../login-verification-modal/login-verification-modal';
import { FormValidatorService } from '../../../services/form-validator-service';
import { EmployeeRole } from '../../../services/employee-service';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginForm {
  readonly passwordVisible = signal(false);
  readonly isSubmitting = signal(false);
  readonly submissionError = signal('');
  readonly roles = EmployeeRole;
  readonly formValidator = inject(FormValidatorService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private modalService = inject(NgbModal);
  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    role: this.fb.control<EmployeeRole | null>(null, Validators.required),
  });

  async onSubmit(): Promise<void> {
    if (this.isSubmitting()) return;
    this.submissionError.set('');
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password, role } = this.loginForm.getRawValue();
    this.isSubmitting.set(true);
    try {
      const response = await this.authService.verifyLoginRequest(email!);
      if (!response?.transactionKey) throw new Error('Missing transaction key');
      const modalRef = this.modalService.open(LoginVerificationModal, {
        size: 'md',
        centered: true,
        windowClass: 'aurum-verification-modal',
        ariaLabelledBy: 'login-verification-title',
        backdrop: 'static',
        keyboard: false,
      });
      modalRef.componentInstance.loginInfo = {
        email: email!, password: password!, role: role!, transactionKey: response.transactionKey,
      };
      // Dismissing the dialog is a normal outcome, not a failed login request.
      void modalRef.result.catch(() => undefined);
    } catch (error) {
      this.submissionError.set(getAuthErrorMessage(error, 'We could not send a verification code. Please try again.'));
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
