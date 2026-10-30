import { TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HomeService } from '../../../services/home-service';
import { ContactUsVerificationModal } from './contact-us-verification-modal';
describe('ContactUsVerificationModal', () => {
  function setup() {
    const modal = { close: vi.fn(), dismiss: vi.fn() };
    const sendContactMessage = vi.fn().mockResolvedValue({ status: 200 });
    TestBed.configureTestingModule({
      providers: [
        { provide: NgbActiveModal, useValue: modal },
        { provide: HomeService, useValue: { sendContactMessage } },
      ],
    });
    const fixture = TestBed.createComponent(ContactUsVerificationModal);
    const component = fixture.componentInstance;
    component.contactInfo = {
      fullName: 'Guest',
      phoneNumber: '+995555123456',
      emailAddress: 'guest@example.com',
      message: 'Hello',
      transactionKey: 'key',
      otp: '',
    };
    fixture.detectChanges();
    return { fixture, component, modal, sendContactMessage };
  }
  it('masks the address and rejects missing or malformed verification codes', async () => {
    const { component, sendContactMessage } = setup();
    expect(component.maskedEmail).toBe('gu•••@example.com');
    await component.submitForm();
    component.verificationModal.patchValue({ otp: 'abc123' });
    await component.submitForm();
    expect(sendContactMessage).not.toHaveBeenCalled();
    expect(component.verificationModal.controls['otp'].touched).toBe(true);
  });
  it('sends the code and closes after successful verification', async () => {
    const { component, modal, sendContactMessage } = setup();
    component.verificationModal.patchValue({ otp: '123456' });
    await component.submitForm();
    expect(sendContactMessage).toHaveBeenCalledWith(
      expect.objectContaining({ otp: '123456', transactionKey: 'key' }),
    );
    expect(modal.close).toHaveBeenCalledWith('verified');
    expect(component.isSubmitting()).toBe(false);
  });
  it('retains the code on failure and allows retry and dismissal', async () => {
    const { component, modal, sendContactMessage } = setup();
    component.verificationModal.patchValue({ otp: '123456' });
    sendContactMessage.mockRejectedValueOnce(new Error('Expired'));
    await component.submitForm();
    expect(component.submissionError()).toContain('check it and try again');
    expect(component.isSubmitting()).toBe(false);
    expect(modal.close).not.toHaveBeenCalled();
    await component.submitForm();
    expect(component.submissionError()).toBe('');
    component.close();
    expect(modal.dismiss).toHaveBeenCalledWith('close');
  });
});
