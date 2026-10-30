import { ProductCategory } from '../../../services/supplier-service';
import { TestBed } from '@angular/core/testing';
import { SupplierFiltering } from './supplier-filtering';
describe('SupplierFiltering', () => {
  it('emits normalized filter changes and preserves valid values', () => {
    const fixture = TestBed.createComponent(SupplierFiltering);
    const component = fixture.componentInstance;
    const changed = vi.fn();
    component.changed.subscribe(changed);

    component.filter(ProductCategory.FLORALS);
    expect(changed).toHaveBeenLastCalledWith({ productType: 'FLORALS' });
    component.filter(undefined);
    expect(changed).toHaveBeenLastCalledWith({ productType: undefined });
    expect(component.capitalizeFirstLetter('FOOD_INGREDIENT')).toBe('Food ingredient');
  });
});
