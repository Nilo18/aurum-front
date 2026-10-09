import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiclePagination } from './vehicle-pagination';

describe('VehiclePagination', () => {
  let component: VehiclePagination;
  let fixture: ComponentFixture<VehiclePagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiclePagination],
    }).compileComponents();

    fixture = TestBed.createComponent(VehiclePagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('emits values and respects disabled controls', () => {
    const changed = vi.fn();
    component.changed.subscribe(changed);
    component.paginate(0, 25);
    expect(changed).toHaveBeenLastCalledWith({ page: 0, size: 25 });
    component.paginate(-1);
    expect(changed).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput('disabled', true);
    component.paginate(0, 10);
    expect(changed).toHaveBeenCalledTimes(1);
  });
});
