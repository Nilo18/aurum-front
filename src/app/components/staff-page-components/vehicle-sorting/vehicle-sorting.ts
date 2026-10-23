import { StringFormatterService } from '../../../services/string-formatter-service';
import { Component, input, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VehicleQuery } from '../../../services/vehicle-service';
@Component({
  selector: 'app-vehicle-sorting',
  imports: [FormsModule],
  templateUrl: './vehicle-sorting.html',
  styleUrl: './vehicle-sorting.scss',
})
export class VehicleSorting {
  readonly stringFormatter = inject(StringFormatterService);
  readonly query = input<VehicleQuery>({});
  readonly disabled = input(false);
  readonly changed = output<Pick<VehicleQuery, 'sortBy' | 'sortDirection'>>();

  readonly fields = ['publicId', 'type', 'passengerCapacity', 'cargoWeightLimit'];
  readonly label = (field: string) =>
    this.stringFormatter
      .human(field.replace(/([A-Z])/g, ' $1'))
      .replace(/^./, (character) => character.toUpperCase());
  sort(field: string, direction: string) {
    if (this.disabled()) return;
    this.changed.emit({ sortBy: field, sortDirection: field ? direction : '' });
  }
}
