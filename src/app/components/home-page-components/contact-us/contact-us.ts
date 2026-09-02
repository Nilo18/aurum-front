import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidatorService } from '../../../services/form-validator-service';

@Component({
  selector: 'app-contact-us',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.scss',
})
export class ContactUs {
  readonly submitted = signal(false);
  private fb = inject(FormBuilder)
  public formValidator = inject(FormValidatorService)
  contactForm!: FormGroup

  ngOnInit() {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(255)]],
      phoneNumber: ['', [Validators.required, this.formValidator.phoneValidator('GE')]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.maxLength(1500)]]
    })
  }

  submitForm() {
    if (this.contactForm.invalid) {
      console.log('Invalid form: ', this.contactForm.value)
      this.contactForm.markAllAsTouched()
    }
    console.log(this.contactForm.value)
  }
}
