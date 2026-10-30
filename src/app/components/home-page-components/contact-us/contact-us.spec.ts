import { TestBed } from '@angular/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HomeService } from '../../../services/home-service';
import { ContactUsVerificationModal } from '../contact-us-verification-modal/contact-us-verification-modal';
import { ContactUs } from './contact-us';
describe('ContactUs', () => {
  function setup() {
    const verifyContactRequest = vi.fn().mockResolvedValue({ transactionKey: 'key' });
    const ref = { componentInstance: {} };
    const open = vi.fn().mockReturnValue(ref);
    TestBed.configureTestingModule({
      providers: [
        { provide: HomeService, useValue: { verifyContactRequest } },
        { provide: NgbModal, useValue: { open } },
      ],
    });
    const fixture = TestBed.createComponent(ContactUs);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance, verifyContactRequest, open, ref };
  }
  it('marks invalid fields and avoids sending incomplete contact details', async () => {
    const { component, verifyContactRequest, open } = setup();
    await component.submitForm();
    expect(component.contactForm.get('fullName')?.touched).toBe(true);
    expect(verifyContactRequest).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
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
  });
});
