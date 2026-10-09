import { FormValidatorService } from '../../../services/form-validator-service';
import { Component, inject, Input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CreateVehicleRequest,
  VehicleDTO,
  VehicleService,
  VehicleType,
} from '../../../services/vehicle-service';
import { getRequestErrorMessage } from '../../../services/request-error';

@Component({
  selector: 'app-vehicle-add-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './vehicle-add-dialog.html',
  styleUrl: './vehicle-add-dialog.scss',
})
export class VehicleAddDialog {
  readonly modal = inject(NgbActiveModal);
  readonly formValidator = inject(FormValidatorService);
  private readonly vehicleService = inject(VehicleService);
  private readonly fb = inject(FormBuilder);
  readonly isSubmitting = signal(false);
  readonly submissionError = signal('');
  readonly vehicleForm = this.fb.group({
    type: [VehicleType.TRUCK as VehicleType | '', Validators.required],
    passengerCapacity: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(100000), Validators.pattern(/^\d+$/)],
    ],
    cargoWeightLimit: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(100000)],
    ],
  });
  editing?: VehicleDTO;

  @Input()
  set vehicle(vehicle: VehicleDTO | undefined) {
    this.editing = vehicle;
    this.submissionError.set('');
    this.vehicleForm.reset({
      type: vehicle?.type ?? VehicleType.TRUCK,
      passengerCapacity: vehicle?.passengerCapacity ?? null,
      cargoWeightLimit: vehicle?.cargoWeightLimit ?? null,
    });
  }

  close(): void {
    if (!this.isSubmitting()) this.modal.dismiss();
  }

  async save(): Promise<void> {
    if (this.isSubmitting()) return;
    this.submissionError.set('');
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }
    const values = this.vehicleForm.getRawValue();
    const request: CreateVehicleRequest = {
      type: values.type as VehicleType,
      passengerCapacity: Number(values.passengerCapacity),
      cargoWeightLimit: Number(values.cargoWeightLimit),
    };
    this.isSubmitting.set(true);
    if (this.editing !== undefined) {
      await this.update({ ...request, publicId: this.editing.publicId });
    } else {
      await this.add(request);
    }
  }

  async add(request: CreateVehicleRequest) {
    try {
      const response = await this.vehicleService.addVehicle(request);
      if (!response?.publicId) {
        this.submissionError.set('The vehicle could not be saved. Please try again.');
        return;
      }
      this.modal.close('Vehicle saved.');
    } catch (error) {
      this.submissionError.set(
        getRequestErrorMessage(error, 'The vehicle could not be saved. Please try again.'),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async update(request: VehicleDTO) {
    try {
      const response = await this.vehicleService.updateVehicle(request);
      if (!response?.publicId) {
        this.submissionError.set('The vehicle could not be saved. Please try again.');
        return;
      }
      this.modal.close('Vehicle saved.');
    } catch (error) {
      this.submissionError.set(
        getRequestErrorMessage(error, 'The vehicle could not be saved. Please try again.'),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
