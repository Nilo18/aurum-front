import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierSorting } from './supplier-sorting';

describe('SupplierSorting', () => {
  let component: SupplierSorting;
  let fixture: ComponentFixture<SupplierSorting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierSorting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierSorting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
