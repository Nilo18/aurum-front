import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { vi } from 'vitest';
import { AuthService } from '../../../services/auth-service';
import { EmployeeRole } from '../../../services/employee-service';
import { LoginVerificationModal } from './login-verification-modal';

describe('LoginVerificationModal', () => {
  const auth = { login: vi.fn() };
  const modal = { close: vi.fn(), dismiss: vi.fn() };
  const router = { navigate: vi.fn().mockResolvedValue(true) };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [LoginVerificationModal],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: NgbActiveModal, useValue: modal },
        { provide: Router, useValue: router },
      ],
    });
  });

  function setup() {
    const fixture = TestBed.createComponent(LoginVerificationModal);
    const component = fixture.componentInstance;
    component.loginInfo = {
      email: 'staff@example.com',
      password: 'test-password',
      role: EmployeeRole.STAFF,
      transactionKey: 'transaction-123',
    };
    fixture.detectChanges();
    return { fixture, component };
  }

  it('requires six digits and displays a masked email', async () => {
    const { fixture, component } = setup();
    for (const otp of ['', '12345', '1234567', 'abcdef']) {
      component.verificationForm.setValue({ otp });
      await component.onSubmit();
    }
    fixture.detectChanges();
    expect(auth.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.invalid-feedback').textContent).toContain(
      'six-digit',
    );
    expect(component.maskedEmail).toBe('st•••@example.com');
  });

  it('locks submission and dismissal while verifying and closes after navigation', async () => {
    const { fixture, component } = setup();
    component.verificationForm.setValue({ otp: '012345' });
    let resolve!: (value: { token: string }) => void;
    auth.login.mockReturnValueOnce(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const pending = component.onSubmit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('input').readOnly).toBe(true);
    component.close();
    await component.onSubmit();
    expect(modal.dismiss).not.toHaveBeenCalled();
    expect(auth.login).toHaveBeenCalledExactlyOnceWith({ ...component.loginInfo, otp: '012345' });
    resolve({ token: 'test-token' });
    await pending;
    expect(router.navigate).toHaveBeenCalledWith(['/staff']);
    expect(modal.close).toHaveBeenCalledWith('verified');
    expect(component.isSubmitting()).toBe(false);
  });

  it('keeps the modal open on backend failure and allows retry', async () => {
    const { fixture, component } = setup();
    component.verificationForm.setValue({ otp: '123456' });
    auth.login.mockRejectedValueOnce(
      new HttpErrorResponse({
        status: 400,
        error: { message: 'The verification code has expired.' },
      }),
    );
    await component.onSubmit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'code has expired',
    );
    expect(component.isSubmitting()).toBe(false);
    expect(modal.close).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    auth.login.mockResolvedValueOnce({ token: 'test-token' });
    await component.onSubmit();
    expect(component.submissionError()).toBe('');
    expect(modal.close).toHaveBeenCalledWith('verified');
  });
});
