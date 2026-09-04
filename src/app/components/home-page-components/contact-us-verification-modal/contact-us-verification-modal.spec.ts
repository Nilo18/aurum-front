import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUsVerificationModal } from './contact-us-verification-modal';

describe('ContactUsVerificationModal', () => {
  let component: ContactUsVerificationModal;
  let fixture: ComponentFixture<ContactUsVerificationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactUsVerificationModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactUsVerificationModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
