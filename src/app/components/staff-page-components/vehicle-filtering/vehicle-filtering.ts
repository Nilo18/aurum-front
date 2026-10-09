import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VehicleQuery, VehicleType } from '../../../services/vehicle-service';
import { human } from '../shared/staff-format';

export type VehicleFilters = Pick<
  VehicleQuery,
  'type' | 'passengerFrom' | 'passengerTo' | 'weightFrom' | 'weightTo'
>;

type CapacityField = 'passengerFrom' | 'passengerTo' | 'weightFrom' | 'weightTo';
type CapacityFilters = Pick<VehicleQuery, CapacityField>;
const capacityFields: CapacityField[] = ['passengerFrom', 'passengerTo', 'weightFrom', 'weightTo'];

@Component({
  selector: 'app-vehicle-filtering',
  imports: [FormsModule],
  templateUrl: './vehicle-filtering.html',
  styleUrl: './vehicle-filtering.scss',
})
export class VehicleFiltering {
  readonly query = input<VehicleQuery>({});
  readonly disabled = input(false);
  readonly changed = output<VehicleFilters>();
  readonly types = Object.values(VehicleType);
  readonly human = human;

  readonly capacityDraft = signal<CapacityFilters>({});
  private previousCapacity: CapacityFilters = {};
  private pendingCapacity: CapacityFilters = {};
  private capacityTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const query = this.query();
      const capacity = Object.fromEntries(
        capacityFields.map((field) => [field, query[field]]),
      ) as CapacityFilters;
      if (capacityFields.some((field) => capacity[field] !== this.previousCapacity[field])) {
        this.cancelPendingCapacity();
        this.capacityDraft.set(capacity);
        this.previousCapacity = capacity;
      }
    });
  }

  ngOnDestroy() {
    this.cancelPendingCapacity();
  }

  private cancelPendingCapacity() {
    clearTimeout(this.capacityTimer);
    this.pendingCapacity = {};
  }

  filterType(type?: VehicleType) {
    if (!this.disabled()) this.changed.emit({ type });
  }

  filterCapacity(field: CapacityField, value: number | null) {
    if (this.disabled()) return;
    this.capacityDraft.update((draft) => ({ ...draft, [field]: value ?? undefined }));
    clearTimeout(this.capacityTimer);
    if (value !== null && (!Number.isFinite(value) || value < 0)) return;
    if (value !== null && field.startsWith('passenger') && !Number.isInteger(value)) return;
    this.pendingCapacity = { ...this.pendingCapacity, [field]: value ?? undefined };
    this.capacityTimer = setTimeout(() => {
      const changes = this.pendingCapacity;
      this.pendingCapacity = {};
      if (!this.disabled()) this.changed.emit(changes);
    }, 400);
  }
}
