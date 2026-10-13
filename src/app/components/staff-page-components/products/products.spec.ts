import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ReplaySubject } from 'rxjs';
import { vi } from 'vitest';
import { Products } from './products';
import { ProductDTO, ProductCategory, ProductService } from '../../../services/product-service';
import { PageResponse } from '../../../services/event-service';
import { ProductsSorting } from '../products-sorting/products-sorting';
import { ProductsPagination } from '../products-pagination/products-pagination';
import { ProductsFiltering } from '../products-filtering/products-filtering';
import { By } from '@angular/platform-browser';

describe('Products backend collection', () => {
  let response: ReplaySubject<PageResponse<ProductDTO>>;
  const getProducts = vi.fn();
  beforeEach(() => {
    response = new ReplaySubject(1);
    getProducts.mockReset().mockImplementation(() => response);
    TestBed.configureTestingModule({
      imports: [Products],
      providers: [{ provide: ProductService, useValue: { getProducts } }],
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
          supplierId: 1,
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
});
