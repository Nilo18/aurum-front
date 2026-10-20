import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ReplaySubject } from 'rxjs';
import { vi } from 'vitest';
import { Products } from './products';
import { ProductRowDTO, ProductCategory, ProductService } from '../../../services/product-service';
import { PageResponse } from '../../../services/event-service';
import { ProductsSorting } from '../products-sorting/products-sorting';
import { ProductsPagination } from '../products-pagination/products-pagination';
import { ProductsFiltering } from '../products-filtering/products-filtering';
import { By } from '@angular/platform-browser';

describe('Products backend collection', () => {
  let response: ReplaySubject<PageResponse<ProductRowDTO>>;
  const getProducts = vi.fn();
  const deleteProduct = vi.fn();
  beforeEach(() => {
    deleteProduct.mockReset();
    response = new ReplaySubject(1);
    getProducts.mockReset().mockImplementation(() => response);
    TestBed.configureTestingModule({
      imports: [Products],
      providers: [{ provide: ProductService, useValue: { getProducts, deleteProduct } }],
    });
  });

  it('renders loading, backend rows and pagination totals', async () => {
    const fixture = TestBed.createComponent(Products);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading products');
    expect(fixture.nativeElement.textContent).not.toContain('No products found');
    response.next({
      content: [
        {
          publicId: 'product-1',
          productName: 'Backend plate',
          category: ProductCategory.TABLEWARE,
          price: 12,
          supplier: { publicId: 'supplier-1', name: 'Supplier' },
          quantity: 3,
        },
      ],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 21,
    });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Backend plate');
    expect(fixture.componentInstance.page()?.totalElements).toBe(21);
    expect(fixture.nativeElement.textContent).not.toContain('Loading products');
  });

  it('shows backend errors and retries without showing an empty state', async () => {
    const fixture = TestBed.createComponent(Products);
    fixture.detectChanges();
    response.error(
      new HttpErrorResponse({ status: 400, error: { message: 'Invalid product query' } }),
    );
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Invalid product query',
    );
    expect(fixture.nativeElement.textContent).not.toContain('No products found');
    response = new ReplaySubject(1);
    response.next({ content: [], pageNumber: 0, pageSize: 10, totalElements: 0 });
    fixture.componentInstance.retry();
    await fixture.whenStable();
    expect(getProducts).toHaveBeenCalledTimes(2);
  });

  it('binds child queries and preserves pagination while resetting search, filters and sorting', async () => {
    const fixture = TestBed.createComponent(Products);
    fixture.detectChanges();
    response.next({ content: [], pageNumber: 0, pageSize: 10, totalElements: 30 });
    await fixture.whenStable();
    fixture.debugElement
      .query(By.directive(ProductsPagination))
      .componentInstance.changed.emit({ page: 2, size: 10 });
    expect(fixture.componentInstance.query().page).toBe(2);
    fixture.debugElement
      .query(By.directive(ProductsSorting))
      .componentInstance.changed.emit({ sortBy: 'price', sortDirection: 'desc' });
    expect(fixture.componentInstance.query().page).toBe(0);
    fixture.debugElement
      .query(By.directive(ProductsFiltering))
      .componentInstance.changed.emit({ productCategory: ProductCategory.GLASSWARE, priceFrom: 0 });
    expect(fixture.componentInstance.query().priceFrom).toBe(0);
    await fixture.whenStable();
    fixture.componentInstance.search.set('  glass  ');
    fixture.componentInstance.searchProducts();
    expect(fixture.componentInstance.query().search).toBe('glass');
    expect(fixture.componentInstance.query().sortBy).toBe('price');
  });
  it('prevents duplicate deletes and returns to the previous page after deleting its final product', async () => {
    const fixture = TestBed.createComponent(Products);
    const component = fixture.componentInstance;
    component.updateQuery({ page: 2 }, false);
    response.next({ content: [], pageNumber: 2, pageSize: 10, totalElements: 21 });
    await fixture.whenStable();
    response.next({
      content: [
        {
          publicId: 'product-1',
          productName: 'Plate',
          category: ProductCategory.TABLEWARE,
          price: 12,
          supplier: { publicId: 'supplier-1', name: 'Supplier' },
          quantity: 3,
        },
      ],
      pageNumber: 2,
      pageSize: 10,
      totalElements: 21,
    });
    await fixture.whenStable();
    let resolveDelete!: (value: unknown) => void;
    deleteProduct.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveDelete = resolve;
      }),
    );
    const pending = component.deleteProduct('product-1');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.products__delete-btn').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.products__delete-btn').textContent).toContain(
      'Deleting',
    );
    await component.deleteProduct('product-1');
    expect(deleteProduct).toHaveBeenCalledTimes(1);
    resolveDelete({ status: 200 });
    await pending;
    expect(component.query().page).toBe(1);
    expect(component.notice()).toBe('Product deleted.');
    expect(component.deleting()).toBeUndefined();
  });

  it('shows a delete failure without reloading the list and allows retry', async () => {
    const fixture = TestBed.createComponent(Products);
    response.next({ content: [], pageNumber: 0, pageSize: 10, totalElements: 0 });
    await fixture.whenStable();
    deleteProduct.mockRejectedValueOnce(
      new HttpErrorResponse({
        status: 409,
        error: { message: 'Product is in use.' },
      }),
    );
    await fixture.componentInstance.deleteProduct('product-1');
    expect(fixture.componentInstance.deleteError()).toBe('Product is in use.');
    expect(fixture.componentInstance.busy()).toBe(false);
    expect(getProducts).toHaveBeenCalledTimes(1);
  });
});
