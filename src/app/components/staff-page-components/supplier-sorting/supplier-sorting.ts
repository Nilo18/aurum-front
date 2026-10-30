import { StringFormatterService } from '../../../services/string-formatter-service';
import { Component, input, output, inject } from '@angular/core';
import { SupplierQuery } from '../../../services/supplier-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-supplier-sorting',
  imports: [FormsModule],
  templateUrl: './supplier-sorting.html',
  styleUrl: './supplier-sorting.scss',
})
export class SupplierSorting {
  readonly stringFormatter = inject(StringFormatterService);
  readonly query = input<SupplierQuery>({});
  readonly changed = output<Pick<SupplierQuery, 'sortBy' | 'sortDirection'>>();
  readonly fields = ['name', 'categories', 'city', 'publicId', 'number'];
  readonly label = (field: string) =>
    this.stringFormatter
      .human(field.replace(/([A-Z])/g, ' $1'))
      .replace(/^./, (character) => character.toUpperCase());

  sort(field: string, direction: string) {
    this.changed.emit({ sortBy: field, sortDirection: field ? direction : '' });
  }
}
