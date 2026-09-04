import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidatorService } from '../../../services/form-validator-service';
import { HomeService } from '../../../services/home-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactUsVerificationModal } from '../contact-us-verification-modal/contact-us-verification-modal';

@Component({
  selector: 'app-contact-us',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.scss',
})
export class ContactUs {
  readonly submitted = signal(false);
  private fb = inject(FormBuilder)
  private homeService = inject(HomeService)
  private modalService = inject(NgbModal)
  public formValidator = inject(FormValidatorService)
  contactForm!: FormGroup

  ngOnInit() {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(255)]],
      phoneNumber: ['', [Validators.required, this.formValidator.phoneValidator('GE')]],
      emailAddress: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.maxLength(1500)]]
    })
  }

  async submitForm() {
    if (this.contactForm.invalid) {
      console.log('Invalid form: ', this.contactForm.value)
      this.contactForm.markAllAsTouched()
      return
    }

    console.log(this.contactForm.value)
    console.log(this.contactForm.value.emailAddress)

    try {
      const res = await this.homeService.verifyContactRequest(this.contactForm.value.emailAddress)

      if (res) {
        this.contactForm.addControl('transactionKey', new FormControl(res.transactionKey))
        this.contactForm.addControl('otp', new FormControl(null))

        const modalRef = this.modalService.open(ContactUsVerificationModal, {
          centered: true,
          size: 'md',
          windowClass: 'aurum-verification-modal'
        })

        modalRef.componentInstance.contactInfo = this.contactForm.value
      }
    } catch (error) {
      console.log(error)
    }
  }
}
