import { Component, ElementRef, computed, inject, resource, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { CuisineType, MenuItem, MenuItemCategory, MenuService } from '../../../services/menu-service';
import { createEventRequestForm, fieldError, localToday } from './event-request.form';
import { EventRequestDraft } from './event-request.models';

@Component({
  selector: 'app-event-request-form',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './event-request-form.html',
  styleUrl: './event-request-form.scss',
})
export class EventRequestForm {
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
    'AURUM BANQUET HALL', 'AURUM CONFERENCE HALL', 'PRIVATE RESIDENCE', 'PARTNER VENUE',
    'HOTEL', 'RESTAURANT', 'OUTDOOR VENUE', 'HISTORICAL VENUE', 'CORPORATE OFFICE', 'OTHER',
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

  // Local review draft; map to the actual POST contract in a service when available.
  // IDs are assigned on creation; the saved client ID belongs in Event.clientId.
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

  edit() {
    this.reviewed.set(false);
    setTimeout(() => this.element.nativeElement.querySelector<HTMLElement>('#name')?.focus());
  }
}
