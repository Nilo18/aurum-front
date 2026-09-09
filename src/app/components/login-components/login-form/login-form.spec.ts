import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { vi } from 'vitest';
import { AuthService, EmployeeRole } from '../../../services/auth-service';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  const auth = { verifyLoginRequest: vi.fn() };
  const modalRef = { componentInstance: {}, result: Promise.resolve('verified') };
  const modal = { open: vi.fn(() => modalRef) };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [LoginForm],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: NgbModal, useValue: modal },
      ],
    });
  });

  function setup() {
    const fixture = TestBed.createComponent(LoginForm);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  it('validates required fields without sending a request', async () => {
    const { fixture, component } = setup();
    await component.onSubmit();
    fixture.detectChanges();
    expect(auth.verifyLoginRequest).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('[aria-invalid="true"]').length).toBe(3);
  });

  it('blocks duplicate submissions and passes credentials and the transaction key to the modal', async () => {
    const { fixture, component } = setup();
    component.loginForm.setValue({ email: 'staff@example.com', password: 'test-password', role: EmployeeRole.OWNER });
    let resolve!: (value: { transactionKey: string }) => void;
    auth.verifyLoginRequest.mockReturnValueOnce(new Promise(r => { resolve = r; }));
    const pending = component.onSubmit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    await component.onSubmit();
    expect(auth.verifyLoginRequest).toHaveBeenCalledTimes(1);
    resolve({ transactionKey: 'transaction-123' });
    await pending;
    expect(modalRef.componentInstance).toEqual({ loginInfo: {
      email: 'staff@example.com', password: 'test-password', role: EmployeeRole.OWNER, transactionKey: 'transaction-123',
    } });
    expect(component.isSubmitting()).toBe(false);
  });

  it('shows backend errors and resets loading so the user can retry', async () => {
    const { fixture, component } = setup();
    component.loginForm.setValue({ email: 'staff@example.com', password: 'test-password', role: EmployeeRole.STAFF });
    auth.verifyLoginRequest.mockRejectedValueOnce(new HttpErrorResponse({ status: 400, error: { message: 'Email verification is unavailable.' } }));
    await component.onSubmit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Email verification is unavailable.');
    expect(component.isSubmitting()).toBe(false);
    expect(modal.open).not.toHaveBeenCalled();
    auth.verifyLoginRequest.mockResolvedValueOnce({ transactionKey: 'retry-key' });
    await component.onSubmit();
    expect(component.submissionError()).toBe('');
    expect(modal.open).toHaveBeenCalledTimes(1);
  });
});
