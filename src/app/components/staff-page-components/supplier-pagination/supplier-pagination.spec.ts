import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierPagination } from './supplier-pagination';

describe('SupplierPagination', () => {
  let component: SupplierPagination;
  let fixture: ComponentFixture<SupplierPagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierPagination]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierPagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
