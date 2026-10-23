import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierFiltering } from './supplier-filtering';

describe('SupplierFiltering', () => {
  let component: SupplierFiltering;
  let fixture: ComponentFixture<SupplierFiltering>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierFiltering]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierFiltering);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
