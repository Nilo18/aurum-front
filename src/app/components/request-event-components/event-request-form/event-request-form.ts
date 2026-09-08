import { Component, ElementRef, computed, inject, resource, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { CuisineType, MenuItem, MenuItemCategory, MenuService } from '../../../services/menu-service';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventService, EventOrderRequest } from '../../../services/event-service';
import { VerifyEventRequestModal } from '../verify-event-request-modal/verify-event-request-modal';
import { SuccessModal } from '../../general-components/success-modal/success-modal';
import { ClientType, EventRequestDraft } from './event-request.models';

function localToday(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const futureDate: ValidatorFn = control =>
  control.value && control.value < localToday() ? { pastDate: true } : null;
const phone: ValidatorFn = control =>
  !control.value || isValidPhoneNumber(control.value) ? null : { phone: true };

function createEventRequestForm(fb: FormBuilder) {
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

function fieldError(control: AbstractControl, attempted: boolean): string | null {
  if (!control.invalid || (!control.touched && !attempted)) return null;
  if (control.hasError('required')) return 'Please complete this field.';
  if (control.hasError('email')) return 'Enter a valid email address.';
  if (control.hasError('phone')) return 'Enter a valid phone number with country code.';
  if (control.hasError('pastDate')) return 'Choose today or a future date.';
  if (control.hasError('maxlength')) return 'Use no more than 255 characters.';
  return 'Please check this value.';
}

@Component({
  selector: 'app-event-request-form',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './event-request-form.html',
  styleUrl: './event-request-form.scss',
})
export class EventRequestForm {
  private readonly eventService = inject(EventService);
  private readonly modalService = inject(NgbModal);
  readonly isVerifying = signal(false);
  readonly submitted = signal(false);
  readonly submissionError = signal('');
  private verificationOpen = false;
  private readonly menuService = inject(MenuService);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly form = createEventRequestForm(inject(FormBuilder));
  readonly client = this.form.controls.client.controls;
  readonly event = this.form.controls.event.controls;
  readonly minDate = localToday();
  readonly eventTypes = [
    'WEDDING', 'CORPORATE EVENT', 'CONFERENCE', 'OFFICIAL RECEPTION', 'ANNIVERSARY',
    'BIRTHDAY', 'GALA DINNER', 'PRODUCT LAUNCH', 'PRIVATE PARTY', 'OTHER',
  ];
  readonly locations = [
    'AURUM_BANQUET_HALL', 'AURUM_CONFERENCE_HALL', 'PRIVATE_RESIDENCE', 'PARTNER_VENUE',
    'HOTEL', 'RESTAURANT', 'OUTDOOR_VENUE', 'HISTORICAL_VENUE', 'CORPORATE_OFFICE', 'OTHER',
  ];
  readonly reviewed = signal(false);
  readonly attempted = signal(false);
  readonly cuisineType = signal(CuisineType.GENERAL);
  readonly cuisines = [
    { value: CuisineType.GENERAL, label: 'Mixed' },
    { value: CuisineType.GEORGIAN, label: 'Georgian' },
    { value: CuisineType.MEDITERRANEAN, label: 'Mediterranean' },
  ];
  readonly menuItems = resource({
    params: () => this.cuisineType(),
    loader: ({ params }) => this.menuService.getMenuItems(params),
  });
  readonly categories: { value: MenuItemCategory; label: string }[] = [
    { value: 'APPETIZER', label: 'Appetizers' },
    { value: 'MAIN_COURSE', label: 'Main courses' },
    { value: 'DESSERT', label: 'Desserts' },
    { value: 'DRINK', label: 'Drinks' },
  ];
  readonly menuGroups = computed(() => {
    const items = this.menuItems.hasValue() ? this.menuItems.value() : [];
    return this.categories.map(category => ({
      ...category, items: items.filter(item => item.category === category.value),
    }));
  });
  readonly selectedMenu = signal<number[]>([]);
  // Display metadata is separate from the ID-only selection and request payload.
  private readonly dishDetails = signal(new Map<number, MenuItem>());
  readonly selectedDishes = computed(() =>
    this.selectedMenu()
      .map(id => this.dishDetails().get(id))
      .filter((item): item is MenuItem => item !== undefined),
  );
  readonly menuLoading = computed(() => this.menuItems.isLoading());
  readonly menuError = computed(() => {
    if (this.menuLoading()) return null;
    const error = this.menuItems.error();
    if (!error) return null;
    const cause = error instanceof Error && error.cause ? error.cause : error;
    if (cause instanceof HttpErrorResponse) {
      if (cause.status === 0) return 'We couldn’t connect to the menu service. Check your connection and try again.';
      if (cause.status === 401 || cause.status === 403) return 'The menu service denied access. Please try again later.';
      if (cause.status >= 500) return 'The menu service is temporarily unavailable. Please try again.';
    }
    return 'We couldn’t load the menu. Please try again.';
  });

  retryMenu() {
    if (!this.menuLoading()) this.menuItems.reload();
  }

  setCuisine(value: string) {
    const cuisine = this.cuisines.find(option => option.value === value);
    if (cuisine) this.cuisineType.set(cuisine.value);
  }

  isAdded(item: MenuItem) {
    return this.selectedMenu().includes(item.id);
  }

  addDish(item: MenuItem) {
    if (this.menuLoading() || this.menuError() || this.isAdded(item)) return;
    this.dishDetails.update(details => new Map(details).set(item.id, item));
    this.selectedMenu.update(ids => [...ids, item.id]);
  }

  removeDish(item: MenuItem) {
    this.selectedMenu.update(ids => ids.filter(id => id !== item.id));
    this.dishDetails.update(details => {
      const updated = new Map(details);
      updated.delete(item.id);
      return updated;
    });
  }

  error(control: AbstractControl) {
    return fieldError(control, this.attempted());
  }

  get request(): EventRequestDraft {
    const { client, event } = this.form.getRawValue();
    return {
      client,
      event: { ...event, guestCount: event.guestCount!, status: 'REQUESTED' },
      menuItemIds: [...this.selectedMenu()],
    };
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

  async orderEvent() {
    if (this.isVerifying() || this.verificationOpen || this.submitted()) return;
    this.review();
    if (this.form.invalid) return;

    const { client, event } = this.form.getRawValue();
    const request: Omit<EventOrderRequest, 'transactionKey' | 'otp'> = {
      client: { clientType: client.type, name: client.name, email: client.email, phone: client.phone },
      event: { ...event, guestCount: event.guestCount!, totalCost: event.totalCost ?? undefined },
      menuItemIds: [...this.selectedMenu()],
    };
    this.isVerifying.set(true);
    this.submissionError.set('');
    try {
      const response = await this.eventService.verifyCreateEventRequest(client.email);
      if (!response?.transactionKey) throw new Error('Missing transaction key');
      const modalRef = this.modalService.open(VerifyEventRequestModal, {
        centered: true,
        size: 'md',
        windowClass: 'aurum-verification-modal',
        backdrop: 'static',
        keyboard: false,
      });
      modalRef.componentInstance.eventInfo = { ...request, transactionKey: response.transactionKey };
      this.verificationOpen = true;
      this.isVerifying.set(false);
      try {
        const result = await modalRef.result;
        if (result === 'verified') {
          this.submitted.set(true);
          const successRef = this.modalService.open(SuccessModal, {
            centered: true,
            size: 'md',
            windowClass: 'aurum-success-modal',
            ariaLabelledBy: 'success-title',
            ariaDescribedBy: 'success-message',
          });
          successRef.componentInstance.title = 'Your event request is in';
          successRef.componentInstance.msg = 'Your email has been verified and your event request has been submitted successfully.';
          void successRef.result.catch(() => {});
        }
      } catch {
        // Dismissing verification keeps the request available for another attempt.
      } finally {
        this.verificationOpen = false;
      }
    } catch {
      this.submissionError.set('We could not send your verification code. Please try again.');
    } finally {
      this.isVerifying.set(false);
    }
  }

  edit() {
    this.reviewed.set(false);
    setTimeout(() => this.element.nativeElement.querySelector<HTMLElement>('#name')?.focus());
  }
}
