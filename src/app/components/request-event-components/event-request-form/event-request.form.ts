import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { ClientType } from './event-request.models';

export function localToday(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const futureDate: ValidatorFn = control =>
  control.value && control.value < localToday() ? { pastDate: true } : null;
const phone: ValidatorFn = control =>
  !control.value || isValidPhoneNumber(control.value) ? null : { phone: true };

export function createEventRequestForm(fb: FormBuilder) {
  const requiredText = [Validators.required, Validators.pattern(/\S/)];
  return fb.group({
    client: fb.nonNullable.group({
      type: fb.nonNullable.control<ClientType>('PERSON', Validators.required),
      name: ['', [...requiredText, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, phone]],
    }),
    event: fb.group({
      eventType: fb.nonNullable.control('', requiredText),
      date: fb.nonNullable.control('', [Validators.required, futureDate]),
      totalCost: fb.control<number | null>(null, [
        Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/),
      ]),
      guestCount: fb.control<number | null>(null, [
        Validators.required, Validators.min(1), Validators.pattern(/^\d+$/),
      ]),
      location: fb.nonNullable.control('', requiredText),
      notes: fb.nonNullable.control(''),
    }),
  });
}

export function fieldError(control: AbstractControl, attempted: boolean): string | null {
  if (!control.invalid || (!control.touched && !attempted)) return null;
  if (control.hasError('required')) return 'Please complete this field.';
  if (control.hasError('email')) return 'Enter a valid email address.';
  if (control.hasError('phone')) return 'Enter a valid phone number with country code.';
  if (control.hasError('pastDate')) return 'Choose today or a future date.';
  if (control.hasError('maxlength')) return 'Use no more than 255 characters.';
  return 'Please check this value.';
}
