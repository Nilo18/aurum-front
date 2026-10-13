import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductCategory, ProductQuery } from '../../../services/product-service';
import { human } from '../shared/staff-format';

@Component({
  selector: 'app-products-filtering',
  imports: [FormsModule],
  templateUrl: './products-filtering.html',
  styleUrl: './products-filtering.scss',
})
export class ProductsFiltering {
  readonly query = input<ProductQuery>({});
  readonly disabled = input(false);
  readonly changed = output<Partial<ProductQuery>>();
  readonly categories = Object.values(ProductCategory);
  readonly human = human;
  readonly ranges = [
    { field: 'priceFrom', label: 'Price from (₾)' },
    { field: 'priceTo', label: 'Price to (₾)' },
    { field: 'quantityFrom', label: 'Quantity from' },
    { field: 'quantityTo', label: 'Quantity to' },
    // { field: 'supplierId', label: 'Supplier ID' },
  ] as const;

  filterCategory(value: ProductCategory | ''): void {
    if (!this.disabled()) this.changed.emit({ productCategory: value || undefined });
  }

  filterNumber(
    field: 'priceFrom' | 'priceTo' | 'quantityFrom' | 'quantityTo' | 'supplierId',
    value: number | null,
  ): void {
    if (this.disabled() || (value !== null && (!Number.isFinite(value) || value < 0))) return;
    this.changed.emit({ [field]: value ?? undefined });
  }
}
