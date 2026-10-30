import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HomeService } from '../../../services/home-service';
import { ContactUsVerificationModal } from '../contact-us-verification-modal/contact-us-verification-modal';
import { ContactUs } from './contact-us';
import { SuccessModal } from '../../general-components/success-modal/success-modal';
describe('ContactUs', () => {
  function setup() {
    const verifyContactRequest = vi.fn().mockResolvedValue({ transactionKey: 'key' });
    let resolveVerification!: (result: string) => void;
    let dismissVerification!: () => void;
    const ref = {
      componentInstance: {},
      result: new Promise<string>((resolve, reject) => {
        resolveVerification = resolve;
        dismissVerification = () => reject('dismissed');
      }),
    };
    const open = vi.fn().mockReturnValue(ref);
    TestBed.configureTestingModule({
      providers: [
        { provide: HomeService, useValue: { verifyContactRequest } },
        { provide: NgbModal, useValue: { open } },
      ],
    });
    const fixture = TestBed.createComponent(ContactUs);
    fixture.detectChanges();
    return {
      fixture,
      component: fixture.componentInstance,
      verifyContactRequest,
      open,
      ref,
      resolveVerification,
      dismissVerification,
    };
  }
  it('marks invalid fields and avoids sending incomplete contact details', async () => {
    const { component, verifyContactRequest, open } = setup();
    await component.submitForm();
    expect(component.contactForm.get('fullName')?.touched).toBe(true);
    expect(verifyContactRequest).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    expect(component.isSubmitting()).toBe(false);
    expect(component.submissionError()).toBe('');
  });
  it('requests verification and passes contact details to the dialog', async () => {
    const { component, verifyContactRequest, open, ref } = setup();
    component.contactForm.setValue({
      fullName: 'Guest',
      emailAddress: 'guest@example.com',
      phoneNumber: '+995555123456',
      message: 'Plan an event',
    });
    await component.submitForm();
    expect(verifyContactRequest).toHaveBeenCalledWith('guest@example.com');
    expect(open).toHaveBeenCalledWith(
      ContactUsVerificationModal,
      expect.objectContaining({ centered: true }),
    );
    expect(ref.componentInstance).toMatchObject({
      contactInfo: { fullName: 'Guest', transactionKey: 'key', otp: null },
    });
  });
  it('keeps contact details after verification request failure', async () => {
    const { component, verifyContactRequest, open } = setup();
    component.contactForm.setValue({
      fullName: 'Guest',
      emailAddress: 'guest@example.com',
      phoneNumber: '+995555123456',
      message: 'Plan an event',
    });
    verifyContactRequest.mockRejectedValue(new Error('Offline'));
    await component.submitForm();
    expect(component.contactForm.get('message')?.value).toBe('Plan an event');
    expect(open).not.toHaveBeenCalled();
    expect(component.isSubmitting()).toBe(false);
    expect(component.submissionError()).toContain('Please try again');
  });

  it('opens the success modal only after the message is sent', async () => {
    const { component, open, ref, resolveVerification } = setup();
    component.contactForm.setValue({
      fullName: 'Guest',
      emailAddress: 'guest@example.com',
      phoneNumber: '+995555123456',
      message: 'Plan an event',
    });
    await component.submitForm();
    expect(open).toHaveBeenCalledTimes(1);
    expect(component.submitted()).toBe(false);

    const successRef = { componentInstance: {}, result: Promise.resolve() };
    open.mockReturnValueOnce(successRef);
    resolveVerification('verified');
    await ref.result;

    expect(open).toHaveBeenLastCalledWith(
      SuccessModal,
      expect.objectContaining({ windowClass: 'aurum-success-modal' }),
    );
    expect(successRef.componentInstance).toMatchObject({ title: 'Your message has been sent' });
    expect(component.submitted()).toBe(true);
  });

  it('does not show success when verification is dismissed', async () => {
    const { component, open, ref, dismissVerification } = setup();
    component.contactForm.setValue({
      fullName: 'Guest',
      emailAddress: 'guest@example.com',
      phoneNumber: '+995555123456',
      message: 'Plan an event',
    });
    await component.submitForm();
    dismissVerification();
    await ref.result.catch(() => {});

    expect(open).toHaveBeenCalledTimes(1);
    expect(component.submitted()).toBe(false);
    expect(component.submissionError()).toBe('');
  });

  it('shows loading and prevents duplicate requests until verification completes', async () => {
    const { fixture, component, verifyContactRequest } = setup();
    component.contactForm.setValue({
      fullName: 'Guest',
      emailAddress: 'guest@example.com',
      phoneNumber: '+995555123456',
      message: 'Plan an event',
    });
    let resolveRequest!: (value: { transactionKey: string }) => void;
    verifyContactRequest.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    const submission = component.submitForm();
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Sending verification code');
    expect(fixture.nativeElement.querySelector('form').getAttribute('aria-busy')).toBe('true');
    await component.submitForm();
    expect(verifyContactRequest).toHaveBeenCalledTimes(1);

    resolveRequest({ transactionKey: 'key' });
    await submission;
    fixture.detectChanges();
    expect(button.disabled).toBe(false);
    expect(component.isSubmitting()).toBe(false);
  });

  it('displays backend errors and clears them when retrying', async () => {
    const { fixture, component, verifyContactRequest, ref } = setup();
    component.contactForm.setValue({
      fullName: 'Guest',
      emailAddress: 'guest@example.com',
      phoneNumber: '+995555123456',
      message: 'Plan an event',
    });
    verifyContactRequest.mockRejectedValueOnce(
      new HttpErrorResponse({ status: 400, error: { message: 'Email cannot be verified.' } }),
    );
    await component.submitForm();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Email cannot be verified.',
    );

    await component.submitForm();
    fixture.detectChanges();
    expect(component.submissionError()).toBe('');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(ref.componentInstance).toMatchObject({ contactInfo: { transactionKey: 'key' } });
  });
});
