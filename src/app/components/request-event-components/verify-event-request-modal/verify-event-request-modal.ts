import { Component, inject, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventOrderRequest, EventService } from '../../../services/event-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-verify-event-request-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './verify-event-request-modal.html',
  styleUrl: './verify-event-request-modal.scss',
})
export class VerifyEventRequestModal {
  private modal = inject(NgbActiveModal)
  private fb = inject(FormBuilder)
  private eventService = inject(EventService)
  readonly isSubmitting = signal(false)
  readonly submissionError = signal('')
  verificationModal!: FormGroup
  eventInfo!: Omit<EventOrderRequest, 'otp'>

  get maskedEmail(): string {
    const email = this.eventInfo?.client.email ?? ''
    const [name, domain] = email.split('@')

    if (!name || !domain) return 'your email address'

    const visible = name.slice(0, Math.min(2, name.length))
    return `${visible}${'•'.repeat(Math.max(3, name.length - visible.length))}@${domain}`
  }

  ngOnInit() {
    this.verificationModal = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      transactionKey: this.eventInfo.transactionKey
    })
  }

  close() {
    if (!this.isSubmitting()) this.modal.dismiss('close')
  }

  async submitForm() {
    if (this.isSubmitting()) return
    if (this.verificationModal.invalid) {
      this.verificationModal.markAllAsTouched()
      return
    }

    this.isSubmitting.set(true)
    this.submissionError.set('')

    try {
      await this.eventService.createEvent({ ...this.eventInfo, otp: this.verificationModal.value.otp })
      this.modal.close('verified')
    } catch {
      this.submissionError.set('We could not verify that code. Please check it and try again.')
    } finally {
      this.isSubmitting.set(false)
    }
  }
}
