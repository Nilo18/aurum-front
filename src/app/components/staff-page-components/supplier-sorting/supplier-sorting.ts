import { Component, input, output } from '@angular/core';
import { SupplierQuery } from '../../../services/supplier-service';
import { FormsModule } from '@angular/forms';
import { human } from '../shared/staff-format';

@Component({
  selector: 'app-supplier-sorting',
  imports: [FormsModule],
  templateUrl: './supplier-sorting.html',
  styleUrl: './supplier-sorting.scss',
})
export class SupplierSorting {
  readonly query = input<SupplierQuery>({})
  readonly changed = output<Pick<SupplierQuery, 'sortBy' | 'sortDirection'>>()
  readonly fields = ['name', 'categories', 'city', 'publicId', 'number']
  readonly label = (field: string) =>
    human(field.replace(/([A-Z])/g, ' $1')).replace(/^./, (character) => character.toUpperCase());

  sort(field: string, direction: string) {
    console.log(`Field ${field} changed, direction ${direction} changed, outputting to main suppliers section`)
    this.changed.emit({ sortBy: field, sortDirection: field ? direction : ''})
  }
}
