import { Component, ElementRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { isValidPhoneNumber } from 'libphonenumber-js';

type Field = { key: string; label: string; type: string; placeholder?: string; required?: boolean; options?: string[]; autocomplete?: string; min?: string; step?: string; wide?: boolean };

@Component({
  selector: 'app-event-request-form',
  imports: [ReactiveFormsModule],
  templateUrl: './event-request-form.html',
  styleUrl: './event-request-form.scss',
})
export class EventRequestForm {
  private readonly fb = inject(FormBuilder);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly reviewed = signal(false);
  readonly attempted = signal(false);
  private today() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  readonly minDate = this.today();
  readonly form = this.fb.group({
    client: this.fb.nonNullable.group({
      type: ['PERSON', Validators.required],
      name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, (control: { value: string }) => !control.value || isValidPhoneNumber(control.value) ? null : { phone: true }]],
    }),
    event: this.fb.group({
      eventType: ['', Validators.required],
      date: ['', [Validators.required, (control: { value: string | null }) => control.value && control.value < this.today() ? { pastDate: true } : null]],
      guestCount: [null as number | null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      location: ['', [Validators.required, Validators.pattern(/\S/)]],
      totalCost: [null as number | null, [Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      cuisineType: [''], appetizer: [''], mainCourse: [''], dessert: [''], drinks: [''], notes: [''],
    }),
  });
  readonly sections: { group: 'client' | 'event'; number: string; title: string; description: string; fields: Field[] }[] = [
    { group: 'client', number: '01', title: 'A little about you', description: 'The right details for a personal approach.', fields: [
      { key: 'name', label: 'Full name / organization name', type: 'text', required: true, placeholder: 'How should we address you?', autocomplete: 'name', wide: true },
      { key: 'email', label: 'Email address', type: 'email', required: true, placeholder: 'you@example.com', autocomplete: 'email' },
      { key: 'phone', label: 'Phone number', type: 'tel', required: true, placeholder: '+995 555 123 456', autocomplete: 'tel' },
    ] },
    { group: 'event', number: '02', title: 'Set the scene', description: 'Tell us when, where, and what you’re celebrating.', fields: [
      { key: 'eventType', label: 'Event type', type: 'select', required: true, options: ['Wedding', 'Corporate event', 'Private celebration', 'Birthday', 'Gala dinner', 'Other'] },
      { key: 'date', label: 'Event date', type: 'date', required: true, min: this.minDate },
      { key: 'guestCount', label: 'Number of guests', type: 'number', required: true, placeholder: 'e.g. 100', min: '1', step: '1' },
      { key: 'totalCost', label: 'Proposed total budget', type: 'number', placeholder: 'Your estimated budget', min: '0', step: '0.01' },
      { key: 'location', label: 'Event location', type: 'text', required: true, placeholder: 'Venue, city, or tell us if you need suggestions', wide: true },
    ] },
    { group: 'event', number: '03', title: 'A taste of your occasion', description: 'Share your preferences, or leave these open for inspiration.', fields: [
      { key: 'cuisineType', label: 'Cuisine preference', type: 'text', placeholder: 'e.g. Georgian, Mediterranean, or a fusion', wide: true },
      { key: 'appetizer', label: 'Appetizer', type: 'text', placeholder: 'A favourite way to begin' },
      { key: 'mainCourse', label: 'Main course', type: 'text', placeholder: 'What would you love to serve?' },
      { key: 'dessert', label: 'Dessert', type: 'text', placeholder: 'Something sweet to finish' },
      { key: 'drinks', label: 'Drinks', type: 'text', placeholder: 'Wine, cocktails, non-alcoholic…' },
      { key: 'notes', label: 'Anything else we should know?', type: 'textarea', placeholder: 'Your vision, dietary requirements, accessibility needs, budget currency, or special requests…', wide: true },
    ] },
  ];

  error(group: string, key: string): string | null {
    const control = this.form.get([group, key]);
    if (!control?.invalid || (!control.touched && !this.attempted())) return null;
    if (control.hasError('required')) return 'Please complete this field.';
    if (key === 'email') return 'Enter a valid email address.';
    if (key === 'phone') return 'Enter a valid phone number with country code.';
    if (key === 'date') return 'Choose today or a future date.';
    if (key === 'guestCount') return 'Enter a whole number of at least 1.';
    if (key === 'totalCost') return 'Enter a non-negative amount with up to 2 decimal places.';
    return 'Enter a valid value (name: maximum 255 characters).';
  }

  // IDs and clientId are assigned by the backend when the records are created.
  get request() {
    const value = this.form.getRawValue();
    return { client: value.client, event: { ...value.event, status: 'REQUESTED' as const } };
  }

  review() {
    this.attempted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.element.nativeElement.querySelector<HTMLElement>('input.ng-invalid, select.ng-invalid, textarea.ng-invalid')?.focus();
      return;
    }
    this.reviewed.set(true);
    setTimeout(() => this.element.nativeElement.querySelector<HTMLElement>('#review-title')?.focus());
  }

  edit() {
    this.reviewed.set(false);
    setTimeout(() => this.element.nativeElement.querySelector<HTMLElement>('#name')?.focus());
  }

  value(group: string, key: string): string {
    const value = this.form.get([group, key])?.value;
    return value === null || value === '' ? 'To be discussed' : String(value);
  }
}

