import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsFiltering } from './products-filtering';

describe('ProductsFiltering', () => {
  let component: ProductsFiltering;
  let fixture: ComponentFixture<ProductsFiltering>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsFiltering],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsFiltering);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
