import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../../services/employee-service';
import { Router } from '@angular/router';
import { getRequestErrorMessage } from '../../../services/request-error';
import { FormValidatorService } from '../../../services/form-validator-service';

@Component({
  selector: 'app-registration-form',
  imports: [ReactiveFormsModule],
  templateUrl: './registration-form.html',
  styleUrl: './registration-form.scss',
})
export class RegistrationForm {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  public formValidator = inject(FormValidatorService);
  token = input.required<string | null>();
  readonly isSubmitting = signal(false);
  readonly submissionError = signal('');
  readonly requestSent = signal(false);
  registerForm!: FormGroup;

  ngOnInit() {
    this.registerForm = this.fb.group({
      token: [this.token(), [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      password: ['', [Validators.required]],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting() || this.requestSent()) return;
    this.submissionError.set('');
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    try {
      const res = await this.employeeService.completeRegistration(this.registerForm.getRawValue());
      if (res.status !== 200 || !res.token) {
        this.submissionError.set('We could not complete registration. Please try again.');
        return;
      }
      localStorage.setItem('aurum_token', res.token);
      this.requestSent.set(true);
      await this.router.navigate(['/staff']);
    } catch (error) {
      this.submissionError.set(
        this.requestSent()
          ? 'Your account was created, but the workspace could not open. Use the link below to continue.'
          : getRequestErrorMessage(error, 'We could not complete registration. Please try again.'),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
