import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StaffPreviewStore } from '../shared/staff-preview-store';
import { Row } from '../shared/staff-row';
import { human } from '../shared/staff-format';
import { VehicleDTO, VehicleQuery, VehicleService } from '../../../services/vehicle-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { VehicleFiltering } from '../vehicle-filtering/vehicle-filtering';
import { VehicleSorting } from '../vehicle-sorting/vehicle-sorting';
import { VehiclePagination } from '../vehicle-pagination/vehicle-pagination';

@Component({
  selector: 'app-vehicles',
  imports: [FormsModule, VehicleFiltering, VehicleSorting, VehiclePagination],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.scss',
})
export class Vehicles {
  readonly store = inject(StaffPreviewStore);
  private vehicleService = inject(VehicleService);
  readonly human = human;
  readonly editor = signal(false);
  readonly notice = signal('');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('editorDialog');
  private vehicleQuery = signal<VehicleQuery>({
    page: 0,
    size: 10,
    sortBy: '',
    sortDirection: '',
  });
  vehicles = rxResource({
    params: () => this.vehicleQuery(),
    stream: ({ params }) => this.vehicleService.getVehicles(params),
  });
  readonly query = this.vehicleQuery.asReadonly();
  readonly page = computed(() => (this.vehicles.hasValue() ? this.vehicles.value() : undefined));
  readonly rows = computed(() => this.page()?.content ?? []);
  readonly busy = computed(() => this.vehicles.isLoading());

  updateQuery(changes: Partial<VehicleQuery>, resetPage = true) {
    this.vehicleQuery.update((query) => ({
      ...query,
      ...changes,
      ...(resetPage ? { page: 0 } : {}),
    }));
  }

  clearFilters() {
    this.updateQuery({
      type: undefined,
      passengerFrom: undefined,
      passengerTo: undefined,
      weightFrom: undefined,
      weightTo: undefined,
    });
  }

  retry() {
    if (!this.busy()) this.vehicles.reload();
  }

  editing?: Row;
  draft: Row = {};

  constructor() {
    effect(() => {
      const dialog = this.dialog()?.nativeElement;
      if (dialog && !dialog.open) dialog.showModal();
    });
  }

  open(row?: VehicleDTO): void {
    this.editing = row ? { ...row } : undefined;
    this.draft = row
      ? { ...row }
      : {
          type: 'TRUCK',
          passengerCapacity: '',
          cargoWeightLimit: '',
        };
    this.editor.set(true);
  }

  close(): void {
    this.editor.set(false);
  }

  save(): void {
    const row = { ...this.draft };
    row['passengerCapacity'] = Number(row['passengerCapacity']);
    row['cargoWeightLimit'] = Number(row['cargoWeightLimit']);
    this.store.save('vehicles', row, this.editing);
    this.close();
    this.notice.set('Vehicle saved in this preview session.');
  }
}
