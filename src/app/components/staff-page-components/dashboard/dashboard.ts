import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StaffPreviewStore } from '../shared/staff-preview-store';
import { human } from '../shared/staff-format';
@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  readonly store = inject(StaffPreviewStore);
  readonly human = human;
  readonly links = [
    'clients',
    'employees',
    'vehicles',
    'products',
    'suppliers',
    'menu',
    'feedback',
  ] as const;
  readonly events = computed(() => this.store.data().events);
  readonly upcoming = computed(() =>
    this.events()
      .filter((row) => ['CONFIRMED', 'PLANNING'].includes(String(row['status'])))
      .sort((a, b) => String(a['date']).localeCompare(String(b['date']))),
  );
  readonly requested = computed(
    () => this.events().filter((row) => row['status'] === 'REQUESTED').length,
  );
  readonly total = computed(() =>
    this.events()
      .filter((row) => !['REJECTED', 'CANCELLED'].includes(String(row['status'])))
      .reduce((sum, row) => sum + Number(row['totalCost']), 0),
  );
  clientName(value: unknown): string {
    return String(
      this.store.data().clients.find((row) => row['id'] === Number(value))?.['name'] ??
        `Client #${value}`,
    );
  }
}
