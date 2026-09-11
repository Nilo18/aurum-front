import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { RegistrationForm } from './registration-form';
import { EmployeeService } from '../../../services/employee-service';

describe('RegistrationForm request states', () => {
  const completeRegistration = vi.fn();
  const navigate = vi.fn();
  let component: RegistrationForm;

  beforeEach(() => {
    completeRegistration.mockReset();
    navigate.mockReset().mockResolvedValue(true);
    TestBed.configureTestingModule({
      imports: [RegistrationForm],
      providers: [
        { provide: EmployeeService, useValue: { completeRegistration } },
        { provide: Router, useValue: { navigate } },
      ],
    });
    const fixture = TestBed.createComponent(RegistrationForm);
    fixture.componentRef.setInput('token', 'invitation');
    component = fixture.componentInstance;
    component.ngOnInit();
    component.registerForm.setValue({
      token: 'invitation',
      name: 'Test User',
      password: 'test-password',
    });
  });

  afterEach(() => localStorage.removeItem('aurum_token'));

  it('blocks duplicates while pending and retains values on backend failure', async () => {
    let rejectRequest!: (reason: unknown) => void;
    completeRegistration.mockReturnValue(
      new Promise((_, reject) => {
        rejectRequest = reject;
      }),
    );
    const pending = component.onSubmit();
    expect(component.isSubmitting()).toBe(true);
    await component.onSubmit();
    expect(completeRegistration).toHaveBeenCalledTimes(1);
    rejectRequest(new HttpErrorResponse({ status: 400, error: { message: 'Invitation expired' } }));
    await pending;
    expect(component.isSubmitting()).toBe(false);
    expect(component.submissionError()).toBe('Invitation expired');
    expect(component.registerForm.value.name).toBe('Test User');
    completeRegistration.mockResolvedValue({ status: 200, token: 'session' });
    await component.onSubmit();
    expect(component.submissionError()).toBe('');
    expect(component.requestSent()).toBe(true);
    expect(navigate).toHaveBeenCalledWith(['/staff']);
    await component.onSubmit();
    expect(completeRegistration).toHaveBeenCalledTimes(2);
  });

  it('does not submit invalid forms or accept an unsuccessful response', async () => {
    component.registerForm.patchValue({ name: '' });
    await component.onSubmit();
    expect(completeRegistration).not.toHaveBeenCalled();
    component.registerForm.patchValue({ name: 'Test User' });
    completeRegistration.mockResolvedValue({ status: 400 });
    await component.onSubmit();
    expect(component.submissionError()).not.toBe('');
    expect(component.requestSent()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
});
