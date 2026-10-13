import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StaffPreviewStore } from '../shared/staff-preview-store';
import { Row } from '../shared/staff-row';
import { human, currency } from '../shared/staff-format';
import { ProductDTO, ProductQuery, ProductService } from '../../../services/product-service';
import { rxResource } from '@angular/core/rxjs-interop';

import { ProductsFiltering } from '../products-filtering/products-filtering';
import { ProductsSorting } from '../products-sorting/products-sorting';
import { ProductsPagination } from '../products-pagination/products-pagination';
import { getRequestErrorMessage } from '../../../services/request-error';

@Component({
  selector: 'app-products',
  imports: [FormsModule, ProductsFiltering, ProductsSorting, ProductsPagination],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  readonly store = inject(StaffPreviewStore);
  private productService = inject(ProductService);
  readonly human = human;
  readonly currency = currency;
  readonly productQuery = signal<ProductQuery>({
    page: 0,
    size: 10,
    search: '',
    sortBy: '',
    sortDirection: '',
  });
  readonly search = signal('');
  readonly query = this.productQuery.asReadonly();
  readonly error = computed(() => {
    const error = this.products.error();
    return error ? getRequestErrorMessage(error, 'Unable to load products. Please try again.') : '';
  });
  readonly busy = computed(() => this.products.isLoading());
  readonly editor = signal(false);
  readonly notice = signal('');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('editorDialog');
  readonly products = rxResource({
    params: () => this.productQuery(),
    stream: ({ params }) => this.productService.getProducts(params),
  });
  readonly page = computed(() => (this.products.hasValue() ? this.products.value() : undefined));
  readonly rows = computed(() => this.page()?.content ?? []);

  searchProducts(): void {
    if (this.busy()) return;
    const search = this.search().trim();
    this.search.set(search);
    this.updateQuery({ search });
  }

  retry(): void {
    if (!this.busy()) this.products.reload();
  }

  editing?: Row;
  draft: Row = {};

  updateQuery(changes: Partial<ProductQuery>, resetPage = true) {
    this.productQuery.update((query) => ({
      ...query,
      ...changes,
      ...(resetPage ? { page: 0 } : {}),
    }));
  }

  constructor() {
    effect(() => {
      const dialog = this.dialog()?.nativeElement;
      if (dialog && !dialog.open) dialog.showModal();
    });
  }

  supplierName(value: unknown): string {
    return String(
      this.store.data().suppliers.find((row) => row['id'] === Number(value))?.['partnerNumber'] ??
        `Supplier #${value}`,
    );
  }

  open(row?: ProductDTO | Row): void {
    this.editing = row ? { ...row } : undefined;
    this.draft = row
      ? { ...row }
      : {
          productName: '',
          category: '',
          price: '',
          supplierId: '',
          quantity: '',
        };
    this.editor.set(true);
  }

  close(): void {
    this.editor.set(false);
  }

  save(): void {
    const row = { ...this.draft };
    row['price'] = Number(row['price']);
    row['supplierId'] = Number(row['supplierId']);
    row['quantity'] = Number(row['quantity']);
    this.store.save('products', row, this.editing);
    this.close();
    this.notice.set('Product saved in this preview session.');
  }
}
