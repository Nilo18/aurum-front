import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsSorting } from './products-sorting';

describe('ProductsSorting', () => {
  let component: ProductsSorting;
  let fixture: ComponentFixture<ProductsSorting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsSorting],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsSorting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
