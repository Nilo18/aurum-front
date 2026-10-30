import { ProductCategory } from '../../../services/product-service';
import { TestBed } from '@angular/core/testing';
import { ProductsFiltering } from './products-filtering';
describe('ProductsFiltering', () => {
  it('emits normalized filter changes and preserves valid values', () => {
    const fixture = TestBed.createComponent(ProductsFiltering);
    const component = fixture.componentInstance;
    const changed = vi.fn();
    component.changed.subscribe(changed);

    component.filterCategory(ProductCategory.TABLEWARE);
    expect(changed).toHaveBeenLastCalledWith({ productCategory: 'TABLEWARE' });
    component.filterCategory('');
    expect(changed).toHaveBeenLastCalledWith({ productCategory: undefined });
    component.filterNumber('quantityFrom', 0);
    expect(changed).toHaveBeenLastCalledWith({ quantityFrom: 0 });
    component.filterNumber('priceTo', null);
    expect(changed).toHaveBeenLastCalledWith({ priceTo: undefined });
    component.filterNumber('priceFrom', -1);
    component.filterNumber('priceFrom', NaN);
    fixture.componentRef.setInput('disabled', true);
    component.filterCategory(ProductCategory.TABLEWARE);
    component.filterNumber('priceFrom', 10);
    expect(changed).toHaveBeenCalledTimes(4);
  });
});
