import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VehicleAddDialog } from '../vehicle-add-dialog/vehicle-add-dialog';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Vehicles } from './vehicles';
import { VehicleService, VehicleType } from '../../../services/vehicle-service';

describe('Vehicles reactive query', () => {
  const getVehicles = vi.fn();
  const open = vi.fn();
  const deleteVehicle = vi.fn();
  beforeEach(() => {
    open.mockReset();
    deleteVehicle.mockReset();
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
      providers: [
        { provide: VehicleService, useValue: { getVehicles, deleteVehicle } },
        { provide: NgbModal, useValue: { open } },
      ],
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
  it('opens the ng-bootstrap dialog with the selected vehicle and receives its save notice', async () => {
    const fixture = TestBed.createComponent(Vehicles);
    await fixture.whenStable();
    const componentInstance = {};
    open.mockReturnValue({
      componentInstance,
      result: Promise.resolve('Vehicle saved in this preview session.'),
    });
    const vehicle = fixture.componentInstance.rows()[0];
    fixture.componentInstance.open(vehicle);
    expect(open).toHaveBeenCalledWith(
      VehicleAddDialog,
      expect.objectContaining({ ariaLabelledBy: 'vehicle-editor-title' }),
    );
    expect(componentInstance).toEqual({ vehicle });
    await Promise.resolve();
    expect(fixture.componentInstance.notice()).toContain('Vehicle saved');
    await fixture.whenStable();
    open.mockReturnValue({ componentInstance: {}, result: Promise.reject('cancel') });
    fixture.componentInstance.open();
    await Promise.resolve();
  });
  it('shows delete loading, prevents duplicate requests, and reloads after success', async () => {
    const fixture = TestBed.createComponent(Vehicles);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    let resolveDelete!: (value: unknown) => void;
    deleteVehicle.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveDelete = resolve;
      }),
    );
    const pending = component.deleteVehicle('vehicle-42');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.vehicles__delete-btn').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.vehicles__delete-btn').textContent).toContain(
      'Deleting',
    );
    await component.deleteVehicle('vehicle-42');
    expect(deleteVehicle).toHaveBeenCalledTimes(1);
    getVehicles.mockReturnValueOnce(
      of({ content: [], pageNumber: 0, pageSize: 10, totalElements: 0 }),
    );
    resolveDelete({ status: 200 });
    await pending;
    await fixture.whenStable();
    expect(component.deleting()).toBeUndefined();
    expect(component.notice()).toBe('Vehicle deleted.');
    expect(component.rows()).toEqual([]);
    expect(getVehicles).toHaveBeenCalledTimes(2);
  });
  it('preserves rows on delete failure and shows backend messages before allowing retry', async () => {
    const fixture = TestBed.createComponent(Vehicles);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    deleteVehicle.mockRejectedValueOnce(
      new HttpErrorResponse({
        status: 409,
        error: { message: 'Vehicle is assigned to an event.' },
      }),
    );
    await component.deleteVehicle('vehicle-42');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Vehicle is assigned',
    );
    expect(component.rows()).toHaveLength(1);
    expect(component.busy()).toBe(false);
    expect(getVehicles).toHaveBeenCalledTimes(1);
    deleteVehicle.mockResolvedValueOnce({ status: 400, message: 'Cannot delete vehicle.' });
    await component.deleteVehicle('vehicle-42');
    expect(component.deleteError()).toBe('Cannot delete vehicle.');
    expect(component.deleting()).toBeUndefined();
  });
  it('returns to the previous page when deleting its final vehicle and reports refresh errors separately', async () => {
    const fixture = TestBed.createComponent(Vehicles);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const rows = component.rows();
    component.updateQuery({ page: 2, size: 25 }, false);
    getVehicles.mockReturnValueOnce(
      of({ content: rows, pageNumber: 2, pageSize: 25, totalElements: 51 }),
    );
    await fixture.whenStable();
    deleteVehicle.mockResolvedValueOnce({ status: 200 });
    getVehicles.mockReturnValueOnce(throwError(() => new Error('offline')));
    await component.deleteVehicle('vehicle-42');
    await fixture.whenStable();
    expect(getVehicles).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, size: 25 }));
    expect(component.deleteError()).toBe('');
    expect(component.loadError()).toContain('Vehicle deleted');
    expect(component.busy()).toBe(false);
  });
});
