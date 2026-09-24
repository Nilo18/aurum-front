import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Clients } from '../clients/clients';
import { Employees } from '../employees/employees';
import { EventRequests } from '../event-requests/event-requests';
import { Events } from '../events/events';
import { Feedback } from '../feedback/feedback';
import { Menu } from '../menu/menu';
import { Products } from '../products/products';
import { Suppliers } from '../suppliers/suppliers';
import { Vehicles } from '../vehicles/vehicles';
import { StaffCollection, StaffPreviewStore } from './staff-preview-store';
import { Row } from './staff-row';

interface EditableSection {
  rows(): Row[];
  draft: Row;
  open(row?: Row): void;
  close(): void;
  save(): void;
}

const sections: [string, Type<EditableSection>, StaffCollection][] = [
  ['Clients', Clients, 'clients'],
  ['Employees', Employees, 'employees'],
  ['Event requests', EventRequests, 'events'],
  ['Events', Events, 'events'],
  ['Feedback', Feedback, 'feedback'],
  ['Menu', Menu, 'menu'],
  ['Products', Products, 'products'],
  ['Suppliers', Suppliers, 'suppliers'],
  ['Vehicles', Vehicles, 'vehicles'],
];

describe('Staff section ownership', () => {
  const showModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');

  beforeAll(() => {
    // jsdom does not implement the native modal dialog API.
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = true;
      },
    });
  });

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterAll(() => {
    if (showModal) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', showModal);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
  });

  for (const [title, componentType, collection] of sections) {
    it(`${title} renders its own editor and saves only its collection`, async () => {
      const fixture = TestBed.createComponent(componentType);
      await fixture.whenStable();
      const component = fixture.componentInstance;
      const store = TestBed.inject(StaffPreviewStore);
      const before = store.data();
      const original = component.rows()[0];
      const editableKey = [
        'email',
        'description',
        'productName',
        'partnerNumber',
        'name',
        'guestCount',
        'cargoWeightLimit',
      ].find((key) => key in original)!;
      const editedValue =
        typeof original[editableKey] === 'number'
          ? Number(original[editableKey]) + 1
          : 'edited@example.com';

      component.open(original);
      await fixture.whenStable();
      const element: HTMLElement = fixture.nativeElement;
      expect(element.querySelector('app-staff-workspace')).toBeNull();
      expect(element.querySelector('dialog')?.open).toBe(true);
      expect(element.querySelectorAll('form [name]').length).toBeGreaterThan(0);

      component.draft[editableKey] = editedValue;
      component.close();
      await fixture.whenStable();
      expect(store.data()).toBe(before);
      expect(element.querySelector('dialog')).toBeNull();

      component.open();
      component.draft = { ...original };
      component.save();
      await fixture.whenStable();
      expect(store.data()[collection]).toHaveLength(before[collection].length + 1);
      const added = store.data()[collection].at(-1)!;
      expect(added['id']).not.toBe(original['id']);
      for (const key of Object.keys(before) as StaffCollection[]) {
        if (key !== collection) expect(store.data()[key]).toBe(before[key]);
      }

      component.open(added);
      component.draft[editableKey] = editedValue;
      component.save();
      expect(store.data()[collection]).toHaveLength(before[collection].length + 1);
      expect(store.data()[collection].at(-1)?.[editableKey]).toBe(editedValue);
      expect(store.data()[collection].at(-1)?.['id']).toBe(added['id']);
    });
  }

  it('keeps the employee form omission and role choices and submits numeric salary', async () => {
    const fixture = TestBed.createComponent(Employees);
    const component = fixture.componentInstance;
    component.open();
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('form [name="name"]')).toBeNull();
    expect(
      Array.from(element.querySelectorAll<HTMLOptionElement>('[name="role"] option')).map(
        (option) => option.value,
      ),
    ).toEqual(['ADMIN', 'STAFF']);

    const salary = element.querySelector<HTMLInputElement>('[name="salary"]')!;
    salary.value = '2750';
    salary.dispatchEvent(new Event('input'));
    const email = element.querySelector<HTMLInputElement>('[name="email"]')!;
    email.value = 'new@example.com';
    email.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    element.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    expect(component.rows().at(-1)).toMatchObject({ salary: 2750, email: 'new@example.com' });
    expect(component.editor()).toBe(false);
  });

  it('updates requests when an event changes across sections', () => {
    const events = TestBed.createComponent(Events).componentInstance;
    const requests = TestBed.createComponent(EventRequests).componentInstance;
    const requested = requests.rows()[0];
    requests.open(requested);
    requests.draft['status'] = 'CONFIRMED';
    requests.draft['totalCost'] = String(Number(requested['totalCost']) + 100);
    requests.save();

    expect(requests.rows().some((row) => row['id'] === requested['id'])).toBe(false);
    expect(events.rows().find((row) => row['id'] === requested['id'])?.['status']).toBe(
      'CONFIRMED',
    );
  });

  it('keeps section filters independent and searches related names', () => {
    const employees = TestBed.createComponent(Employees).componentInstance;
    const events = TestBed.createComponent(Events).componentInstance;
    const products = TestBed.createComponent(Products).componentInstance;
    employees.filter.set('CHEF');
    expect(employees.filtered().map((row) => row['type'])).toEqual(['CHEF']);
    expect(events.filter()).toBe('');
    events.search.set('Atelier');
    expect(events.filtered()).toHaveLength(2);
    events.filter.set('REQUESTED');
    expect(events.filtered()).toHaveLength(1);
    products.search.set('SUP-002');
    expect(products.filtered().map((row) => row['supplierId'])).toEqual([2]);
    employees.search.set('no matching employee');
    expect(employees.filtered()).toEqual([]);
  });
});
