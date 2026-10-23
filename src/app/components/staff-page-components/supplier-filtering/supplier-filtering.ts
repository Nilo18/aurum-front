import { Component, input, output, signal } from '@angular/core';
import { ProductCategory, SupplierQuery } from '../../../services/supplier-service';
import { human } from '../shared/staff-format';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-supplier-filtering',
  imports: [FormsModule],
  templateUrl: './supplier-filtering.html',
  styleUrl: './supplier-filtering.scss',
})
export class SupplierFiltering {
  readonly query = input<SupplierQuery>({})
  readonly changed = output<Pick<SupplierQuery, 'productType'>>()
  categories = Object.values(ProductCategory)
  readonly selectedFilter = signal<ProductCategory | undefined>(undefined)

  capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase().replace('_', ' ');
  }

  filter(field: ProductCategory | undefined) {
    console.log('Filtering ', field)
    this.changed.emit({ productType: field })
  }
}
