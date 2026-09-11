import { Injectable, signal } from '@angular/core';
import { Row } from './staff-row';
import { eventsSeed } from '../events/events.data';
import { clientsSeed } from '../clients/clients.data';
import { employeesSeed } from '../employees/employees.data';
import { vehiclesSeed } from '../vehicles/vehicles.data';
import { productsSeed } from '../products/products.data';
import { suppliersSeed } from '../suppliers/suppliers.data';
import { menuSeed } from '../menu/menu.data';
import { feedbackSeed } from '../feedback/feedback.data';

export type StaffCollection =
  'events' | 'clients' | 'employees' | 'vehicles' | 'products' | 'suppliers' | 'menu' | 'feedback';

/** In-memory preview records shared by staff routes for the current session. */
@Injectable({ providedIn: 'root' })
export class StaffPreviewStore {
  private readonly records = signal<Record<StaffCollection, Row[]>>({
    events: eventsSeed.map((row) => ({ ...row })),
    clients: clientsSeed.map((row) => ({ ...row })),
    employees: employeesSeed.map((row) => ({ ...row })),
    vehicles: vehiclesSeed.map((row) => ({ ...row })),
    products: productsSeed.map((row) => ({ ...row })),
    suppliers: suppliersSeed.map((row) => ({ ...row })),
    menu: menuSeed.map((row) => ({ ...row })),
    feedback: feedbackSeed.map((row) => ({ ...row })),
  });
  readonly data = this.records.asReadonly();

  save(collection: StaffCollection, row: Row, original?: Row): void {
    const saved = {
      ...row,
      id:
        original?.['id'] ??
        Math.max(0, ...this.records()[collection].map((item) => Number(item['id']))) + 1,
    };
    this.records.update((data) => ({
      ...data,
      [collection]: original
        ? data[collection].map((item) => (item['id'] === original['id'] ? saved : item))
        : [...data[collection], saved],
    }));
  }
}
