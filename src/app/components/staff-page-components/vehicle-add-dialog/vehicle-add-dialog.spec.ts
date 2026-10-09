import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VehicleAddDialog } from './vehicle-add-dialog';
import { VehicleService, VehicleType } from '../../../services/vehicle-service';

describe('VehicleAddDialog request states', () => {
  const close = vi.fn();
  const dismiss = vi.fn();
  const addVehicle = vi.fn();
  const updateVehicle = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [VehicleAddDialog],
      providers: [
        { provide: NgbActiveModal, useValue: { close, dismiss } },
        { provide: VehicleService, useValue: { addVehicle, updateVehicle } },
      ],
    });
  });
  function validDialog() {
    const fixture = TestBed.createComponent(VehicleAddDialog);
    fixture.componentInstance.vehicleForm.patchValue({
      passengerCapacity: 2,
      cargoWeightLimit: 3500,
    });
    fixture.detectChanges();
    return fixture;
  }
  it('blocks invalid forms and preserves zero when initializing edits', async () => {
    const component = TestBed.createComponent(VehicleAddDialog).componentInstance;
    await component.save();
    expect(component.vehicleForm.touched).toBe(true);
    expect(addVehicle).not.toHaveBeenCalled();
    component.vehicle = {
      publicId: 'vehicle-42',
      type: VehicleType.TRUCK,
      passengerCapacity: 0,
      cargoWeightLimit: 0,
    };
    expect(component.vehicleForm.value.passengerCapacity).toBe(0);
    component.vehicleForm.patchValue({ passengerCapacity: 1.5 });
    await component.save();
    expect(addVehicle).not.toHaveBeenCalled();
    component.close();
    expect(dismiss).toHaveBeenCalledOnce();
  });
  it('prevents duplicate saves and closing while pending, then allows retry with preserved values', async () => {
    const fixture = validDialog();
    const component = fixture.componentInstance;
    let rejectRequest!: (error: unknown) => void;
    addVehicle.mockReturnValueOnce(
      new Promise((_, reject) => {
        rejectRequest = reject;
      }),
    );
    const pending = component.save();
    expect(component.isSubmitting()).toBe(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    component.close();
    await component.save();
    expect(dismiss).not.toHaveBeenCalled();
    expect(addVehicle).toHaveBeenCalledTimes(1);
    rejectRequest(
      new HttpErrorResponse({ status: 409, error: { message: 'Vehicle already exists.' } }),
    );
    await pending;
    fixture.detectChanges();
    expect(component.isSubmitting()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Vehicle already exists.',
    );
    expect(component.vehicleForm.value.cargoWeightLimit).toBe(3500);
    expect(close).not.toHaveBeenCalled();
    addVehicle.mockResolvedValueOnce({ publicId: 'vehicle-42' });
    await component.save();
    expect(addVehicle).toHaveBeenLastCalledWith({
      type: VehicleType.TRUCK,
      passengerCapacity: 2,
      cargoWeightLimit: 3500,
    });
    expect(close).toHaveBeenCalledWith('Vehicle saved.');
    expect(component.submissionError()).toBe('');
  });
  it.each([
    [0, 'Unable to connect'],
    [429, 'Too many attempts'],
    [503, 'temporarily unavailable'],
  ])('handles HTTP %s errors', async (status, message) => {
    const component = validDialog().componentInstance;
    addVehicle.mockRejectedValueOnce(new HttpErrorResponse({ status: status as number }));
    await component.save();
    expect(component.submissionError()).toContain(message);
    expect(component.isSubmitting()).toBe(false);
    expect(close).not.toHaveBeenCalled();
  });
  it('keeps the dialog open for an incomplete success response', async () => {
    const component = validDialog().componentInstance;
    addVehicle.mockResolvedValueOnce({});
    await component.save();
    expect(component.submissionError()).toContain('could not be saved');
    expect(close).not.toHaveBeenCalled();
  });
  it('updates using edited form values and the original publicId, awaiting completion', async () => {
    const component = validDialog().componentInstance;
    const original = {
      publicId: 'vehicle-42',
      type: VehicleType.TRUCK,
      passengerCapacity: 2,
      cargoWeightLimit: 3500,
    };
    component.vehicle = original;
    component.vehicleForm.patchValue({ passengerCapacity: 8, cargoWeightLimit: 4000 });
    let resolveRequest!: (value: unknown) => void;
    updateVehicle.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    let settled = false;
    const pending = component.save().then(() => {
      settled = true;
    });
    expect(updateVehicle).toHaveBeenCalledWith({
      ...original,
      passengerCapacity: 8,
      cargoWeightLimit: 4000,
    });
    expect(addVehicle).not.toHaveBeenCalled();
    expect(original.passengerCapacity).toBe(2);
    await Promise.resolve();
    expect(settled).toBe(false);
    expect(component.isSubmitting()).toBe(true);
    resolveRequest({ ...original, passengerCapacity: 8, cargoWeightLimit: 4000 });
    await pending;
    expect(component.isSubmitting()).toBe(false);
    expect(close).toHaveBeenCalledWith('Vehicle saved.');
  });
});
