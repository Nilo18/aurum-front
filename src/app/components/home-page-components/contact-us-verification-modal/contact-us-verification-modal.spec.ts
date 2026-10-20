import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HomeService } from '../../../services/home-service';
import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUsVerificationModal } from './contact-us-verification-modal';

describe('ContactUsVerificationModal', () => {
  let component: ContactUsVerificationModal;
  let fixture: ComponentFixture<ContactUsVerificationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactUsVerificationModal],
      providers: [
        { provide: NgbActiveModal, useValue: { close: vi.fn(), dismiss: vi.fn() } },
        { provide: HomeService, useValue: { sendContactMessage: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactUsVerificationModal);
    component = fixture.componentInstance;
    component.contactInfo = {
      fullName: 'Test User',
      phoneNumber: '+14155552671',
      emailAddress: 'test@example.com',
      message: 'Test message',
      transactionKey: 'transaction',
      otp: '',
    };
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
