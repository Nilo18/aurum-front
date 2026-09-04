import { Component, inject, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactRequest, HomeService } from '../../../services/home-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-us-verification-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-us-verification-modal.html',
  styleUrl: './contact-us-verification-modal.scss',
})
export class ContactUsVerificationModal {
  private modal = inject(NgbActiveModal)
  private fb = inject(FormBuilder)
  private homeService = inject(HomeService)
  readonly isSubmitting = signal(false)
  readonly submissionError = signal('')
  verificationModal!: FormGroup
  contactInfo!: ContactRequest

  get maskedEmail(): string {
    const email = this.contactInfo?.emailAddress ?? ''
    const [name, domain] = email.split('@')

    if (!name || !domain) return 'your email address'

    const visible = name.slice(0, Math.min(2, name.length))
    return `${visible}${'•'.repeat(Math.max(3, name.length - visible.length))}@${domain}`
  }

  ngOnInit() {
    this.verificationModal = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      transactionKey: this.contactInfo.transactionKey
    })
  }

  close() {
    this.modal.dismiss('close')
  }

  async submitForm() {
    if (this.verificationModal.invalid) {
      console.log('Invalid form: ', this.verificationModal.value)
      this.verificationModal.markAllAsTouched()
      return
    }

    this.isSubmitting.set(true)
    this.submissionError.set('')

    console.log(this.contactInfo)
    try {
      this.contactInfo.otp = this.verificationModal.value.otp
      await this.homeService.sendContactMessage(this.contactInfo)
      this.modal.close('verified')
    } catch {
      this.submissionError.set('We could not verify that code. Please check it and try again.')
    } finally {
      this.isSubmitting.set(false)
    }
  }
}
