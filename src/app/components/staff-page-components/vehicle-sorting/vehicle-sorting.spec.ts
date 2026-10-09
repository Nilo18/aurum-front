import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleSorting } from './vehicle-sorting';

describe('VehicleSorting', () => {
  let component: VehicleSorting;
  let fixture: ComponentFixture<VehicleSorting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleSorting],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleSorting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('emits values and respects disabled controls', () => {
    const changed = vi.fn();
    component.changed.subscribe(changed);
    component.sort('cargoWeightLimit', 'desc');
    expect(changed).toHaveBeenLastCalledWith({ sortBy: 'cargoWeightLimit', sortDirection: 'desc' });
    component.sort('', 'desc');
    expect(changed).toHaveBeenLastCalledWith({ sortBy: '', sortDirection: '' });
    fixture.componentRef.setInput('disabled', true);
    component.sort('publicId', 'asc');
    expect(changed).toHaveBeenCalledTimes(2);
  });
});
