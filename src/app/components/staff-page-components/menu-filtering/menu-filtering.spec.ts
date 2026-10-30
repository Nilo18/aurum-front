import { TestBed } from '@angular/core/testing';
import { MenuFiltering } from './menu-filtering';
describe('MenuFiltering', () => {
  it('emits normalized filter changes and preserves valid values', () => {
    const fixture = TestBed.createComponent(MenuFiltering);
    const component = fixture.componentInstance;
    const changed = vi.fn();
    component.changed.subscribe(changed);

    fixture.componentRef.setInput('query', {
      type: 'GEORGIAN',
      category: 'APPETIZER',
      priceFrom: 0,
      priceTo: 50,
    });
    component.filter({ priceTo: 25 });
    expect(changed).toHaveBeenLastCalledWith({
      type: 'GEORGIAN',
      category: 'APPETIZER',
      priceFrom: 0,
      priceTo: 25,
    });
    component.filter({ category: undefined });
    expect(changed).toHaveBeenLastCalledWith({
      type: 'GEORGIAN',
      category: undefined,
      priceFrom: 0,
      priceTo: 50,
    });
  });
});
