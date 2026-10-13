import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsPagination } from './products-pagination';

describe('ProductsPagination', () => {
  let component: ProductsPagination;
  let fixture: ComponentFixture<ProductsPagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsPagination],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsPagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
