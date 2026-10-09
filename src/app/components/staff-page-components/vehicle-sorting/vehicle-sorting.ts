import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { human } from '../shared/staff-format';
import { VehicleQuery } from '../../../services/vehicle-service';
@Component({
  selector: 'app-vehicle-sorting',
  imports: [FormsModule],
  templateUrl: './vehicle-sorting.html',
  styleUrl: './vehicle-sorting.scss',
})
export class VehicleSorting {
  readonly query = input<VehicleQuery>({});
  readonly disabled = input(false);
  readonly changed = output<Pick<VehicleQuery, 'sortBy' | 'sortDirection'>>();

  readonly fields = ['publicId', 'type', 'passengerCapacity', 'cargoWeightLimit'];
  readonly label = (field: string) =>
    human(field.replace(/([A-Z])/g, ' $1')).replace(/^./, (character) => character.toUpperCase());
  sort(field: string, direction: string) {
    if (this.disabled()) return;
    this.changed.emit({ sortBy: field, sortDirection: field ? direction : '' });
  }
}
