import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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

  it('keeps section filters independent and searches related names', () => {
    const products = TestBed.createComponent(Products).componentInstance;
    expect(products.filter()).toBe('');
    products.search.set('SUP-002');
    expect(products.filtered().map((row) => row['supplierId'])).toEqual([2]);
  });
});
