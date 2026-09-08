import { TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventService } from '../../../services/event-service';
import { VerifyEventRequestModal } from './verify-event-request-modal';

describe('VerifyEventRequestModal', () => {
  const createEvent = vi.fn();
  const close = vi.fn();
  beforeEach(() => {
    createEvent.mockReset().mockResolvedValue({ status: 200, message: 'Created' });
    close.mockReset();
    TestBed.configureTestingModule({ providers: [
      { provide: EventService, useValue: { createEvent } },
      { provide: NgbActiveModal, useValue: { close, dismiss: vi.fn() } },
    ] });
  });

  async function setup() {
    const fixture = TestBed.createComponent(VerifyEventRequestModal);
    fixture.componentInstance.eventInfo = {
      client: { clientType: 'PERSON', name: 'Test', email: 'test@example.com', phone: '+14155552671' },
      event: { eventType: 'WEDDING', date: '2027-01-01', guestCount: 10, location: 'HOTEL' },
      menuItemIds: [1, 2], transactionKey: 'transaction',
    };
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  it('requires six digits and submits the full request with OTP and transaction key', async () => {
    const component = await setup();
    component.verificationModal.patchValue({ otp: '123' });
    await component.submitForm();
    expect(createEvent).not.toHaveBeenCalled();
    component.verificationModal.patchValue({ otp: '012345' });
    await component.submitForm();
    expect(createEvent).toHaveBeenCalledExactlyOnceWith({ ...component.eventInfo, otp: '012345' });
    expect(close).toHaveBeenCalledWith('verified');
  });

  it('keeps the request available after a failed code and allows retry', async () => {
    const component = await setup();
    createEvent.mockRejectedValueOnce(new Error('Invalid code'));
    component.verificationModal.patchValue({ otp: '123456' });
    await component.submitForm();
    expect(close).not.toHaveBeenCalled();
    expect(component.submissionError()).toBeTruthy();
    expect(component.isSubmitting()).toBe(false);
    await component.submitForm();
    expect(close).toHaveBeenCalledWith('verified');
  });
});
