import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidatorService } from '../../../services/form-validator-service';
import { HomeService } from '../../../services/home-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactUsVerificationModal } from '../contact-us-verification-modal/contact-us-verification-modal';
import { getRequestErrorMessage } from '../../../services/request-error';
import { SuccessModal } from '../../general-components/success-modal/success-modal';

@Component({
  selector: 'app-contact-us',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.scss',
})
export class ContactUs {
  readonly submitted = signal(false);
  readonly isSubmitting = signal(false);
  readonly submissionError = signal('');
  private fb = inject(FormBuilder);
  private homeService = inject(HomeService);
  private modalService = inject(NgbModal);
  public formValidator = inject(FormValidatorService);
  contactForm!: FormGroup;

  ngOnInit() {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(255)]],
      phoneNumber: ['', [Validators.required, this.formValidator.phoneValidator('GE')]],
      emailAddress: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.maxLength(1500)]],
    });
  }

  async submitForm() {
    if (this.isSubmitting()) return;

    this.submissionError.set('');

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      const res = await this.homeService.verifyContactRequest(this.contactForm.value.emailAddress);

      if (res) {
        const modalRef = this.modalService.open(ContactUsVerificationModal, {
          centered: true,
          size: 'md',
          windowClass: 'aurum-verification-modal',
        });

        modalRef.componentInstance.contactInfo = {
          ...this.contactForm.value,
          transactionKey: res.transactionKey,
          otp: null,
        };

        void modalRef.result.then(
          (result) => {
            if (result !== 'verified') return;

            this.submitted.set(true);
            const successRef = this.modalService.open(SuccessModal, {
              centered: true,
              size: 'md',
              windowClass: 'aurum-success-modal',
              ariaLabelledBy: 'success-title',
              ariaDescribedBy: 'success-message',
            });
            successRef.componentInstance.title = 'Your message has been sent';
            successRef.componentInstance.msg =
              'Thank you for contacting us. We’ll be in touch within 24 hours.';
            void successRef.result.catch(() => {});
          },
          () => {
            // Dismissing verification keeps the contact details available for another attempt.
          },
        );
      }
    } catch (error) {
      this.submissionError.set(
        getRequestErrorMessage(
          error,
          'We could not send your verification code. Please try again.',
        ),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
