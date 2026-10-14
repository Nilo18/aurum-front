import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { human, currency } from '../shared/staff-format';
import { ProductQuery, ProductRowDTO, ProductService } from '../../../services/product-service';
import { rxResource } from '@angular/core/rxjs-interop';

import { ProductAddDialog } from '../product-add-dialog/product-add-dialog';
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
  private readonly modal = inject(NgbModal);
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
  readonly deleting = signal<string | undefined>(undefined);
  readonly deleteError = signal('');
  private readonly refreshingAfterDelete = signal(false);
  readonly error = computed(() => {
    const error = this.products.error();
    return error
      ? this.refreshingAfterDelete()
        ? 'Product deleted, but the list could not be refreshed. Please retry.'
        : getRequestErrorMessage(error, 'Unable to load products. Please try again.')
      : '';
  });
  readonly busy = computed(() => this.products.isLoading() || this.deleting() !== undefined);
  readonly notice = signal('');
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

  updateQuery(changes: Partial<ProductQuery>, resetPage = true) {
    this.refreshingAfterDelete.set(false);
    this.productQuery.update((query) => ({
      ...query,
      ...changes,
      ...(resetPage ? { page: 0 } : {}),
    }));
  }

  open(product?: ProductRowDTO): void {
    if (this.busy()) return;
    const modalRef = this.modal.open(ProductAddDialog, {
      centered: true,
      ariaLabelledBy: 'product-editor-title',
      windowClass: 'aurum-vehicle-modal',
      beforeDismiss: () => !modalRef.componentInstance.isSubmitting(),
    });
    modalRef.componentInstance.product = product
      ? {
          publicId: product.publicId,
          productName: product.productName,
          category: product.category,
          price: product.price,
          supplierId: product.supplier.id,
          quantity: product.quantity,
        }
      : undefined;
    void modalRef.result.then(
      (message: string) => {
        this.refreshingAfterDelete.set(false);
        this.notice.set(message);
        this.products.reload();
      },
      () => {},
    );
  }

  async deleteProduct(publicId: string): Promise<void> {
    if (this.busy()) return;
    this.deleting.set(publicId);
    this.deleteError.set('');
    this.notice.set('');
    try {
      const response = await this.productService.deleteProduct(publicId);
      if (response.status < 200 || response.status >= 300) {
        this.deleteError.set(response.message || 'Unable to delete product. Please try again.');
        return;
      }
      this.notice.set('Product deleted.');
      const page = this.page();
      if (page?.content.length === 1 && page.pageNumber > 0) {
        this.updateQuery({ page: page.pageNumber - 1 }, false);
      } else {
        this.products.reload();
      }
      this.refreshingAfterDelete.set(true);
    } catch (error) {
      this.deleteError.set(
        getRequestErrorMessage(error, 'Unable to delete product. Please try again.'),
      );
    } finally {
      this.deleting.set(undefined);
    }
  }
}
