import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { human } from '../shared/staff-format';
import { ProductQuery } from '../../../services/product-service';
@Component({
  selector: 'app-products-sorting',
  imports: [FormsModule],
  templateUrl: './products-sorting.html',
  styleUrl: './products-sorting.scss',
})
export class ProductsSorting {
  readonly query = input<ProductQuery>({});
  readonly disabled = input(false);
  readonly changed = output<Pick<ProductQuery, 'sortBy' | 'sortDirection'>>();

  readonly fields = ['productName', 'category', 'price', 'supplierId', 'quantity'];
  readonly label = (field: string) =>
    human(field.replace(/([A-Z])/g, ' $1')).replace(/^./, (character) => character.toUpperCase());
  sort(field: string, direction: string) {
    if (this.disabled()) return;
    this.changed.emit({ sortBy: field, sortDirection: field ? direction : '' });
  }
}
