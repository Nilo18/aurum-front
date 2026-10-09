import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Vehicles } from './vehicles';
import { VehicleService, VehicleType } from '../../../services/vehicle-service';

describe('Vehicles reactive query', () => {
  const getVehicles = vi.fn();
  beforeEach(() => {
    getVehicles.mockReset().mockReturnValue(
      of({
        content: [
          {
            publicId: 'vehicle-42',
            type: VehicleType.TRUCK,
            passengerCapacity: 2,
            cargoWeightLimit: 3500,
          },
        ],
        pageNumber: 0,
        pageSize: 10,
        totalElements: 1,
      }),
    );
    TestBed.configureTestingModule({
      imports: [Vehicles],
      providers: [{ provide: VehicleService, useValue: { getVehicles } }],
    });
  });
  it('renders resource data without search and fetches merged child changes', async () => {
    const fixture = TestBed.createComponent(Vehicles);
    const component = fixture.componentInstance;
    await fixture.whenStable();
    expect(component.rows()[0].publicId).toBe('vehicle-42');
    expect(fixture.nativeElement.textContent).toContain('#vehicle-42');
    expect(fixture.nativeElement.querySelector('input[placeholder*="Search"]')).toBeNull();
    component.updateQuery({ page: 2, size: 25 }, false);
    await fixture.whenStable();
    component.updateQuery({ type: VehicleType.TRUCK, passengerFrom: 0 });
    await fixture.whenStable();
    expect(getVehicles).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 0, size: 25, type: VehicleType.TRUCK, passengerFrom: 0 }),
    );
    component.updateQuery({ sortBy: 'cargoWeightLimit', sortDirection: 'desc' });
    await fixture.whenStable();
    component.clearFilters();
    await fixture.whenStable();
    expect(getVehicles).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: undefined,
        passengerFrom: undefined,
        size: 25,
        sortBy: 'cargoWeightLimit',
      }),
    );
  });
  it('shows loading failures and reloads on retry', async () => {
    getVehicles.mockReturnValueOnce(throwError(() => new Error('offline')));
    const fixture = TestBed.createComponent(Vehicles);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Unable to load vehicles',
    );
    fixture.componentInstance.retry();
    await fixture.whenStable();
    expect(getVehicles).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});
