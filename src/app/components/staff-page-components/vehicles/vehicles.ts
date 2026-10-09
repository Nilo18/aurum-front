import { getRequestErrorMessage } from '../../../services/request-error';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VehicleAddDialog } from '../vehicle-add-dialog/vehicle-add-dialog';
import { Component, computed, inject, signal } from '@angular/core';
import { human } from '../shared/staff-format';
import { VehicleDTO, VehicleQuery, VehicleService } from '../../../services/vehicle-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { VehicleFiltering } from '../vehicle-filtering/vehicle-filtering';
import { VehicleSorting } from '../vehicle-sorting/vehicle-sorting';
import { VehiclePagination } from '../vehicle-pagination/vehicle-pagination';

@Component({
  selector: 'app-vehicles',
  imports: [VehicleFiltering, VehicleSorting, VehiclePagination],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.scss',
})
export class Vehicles {
  private readonly modal = inject(NgbModal);
  private vehicleService = inject(VehicleService);
  readonly human = human;
  readonly notice = signal('');
  readonly deleting = signal<string | undefined>(undefined);
  readonly deleteError = signal('');
  private readonly refreshingAfterDelete = signal(false);
  readonly loadError = computed(() =>
    this.vehicles.error()
      ? this.refreshingAfterDelete()
        ? 'Vehicle deleted, but the list could not be refreshed. Please retry.'
        : 'Unable to load vehicles. Please try again.'
      : '',
  );
  private vehicleQuery = signal<VehicleQuery>({
    page: 0,
    size: 10,
    sortBy: '',
    sortDirection: '',
  });
  vehicles = rxResource({
    params: () => this.vehicleQuery(),
    stream: ({ params }) => this.vehicleService.getVehicles(params),
  });
  readonly query = this.vehicleQuery.asReadonly();
  readonly page = computed(() => (this.vehicles.hasValue() ? this.vehicles.value() : undefined));
  readonly rows = computed(() => this.page()?.content ?? []);
  readonly busy = computed(() => this.vehicles.isLoading() || this.deleting() !== undefined);

  updateQuery(changes: Partial<VehicleQuery>, resetPage = true) {
    this.refreshingAfterDelete.set(false);
    this.vehicleQuery.update((query) => ({
      ...query,
      ...changes,
      ...(resetPage ? { page: 0 } : {}),
    }));
  }

  clearFilters() {
    this.updateQuery({
      type: undefined,
      passengerFrom: undefined,
      passengerTo: undefined,
      weightFrom: undefined,
      weightTo: undefined,
    });
  }

  retry() {
    if (!this.busy()) this.vehicles.reload();
  }

  open(vehicle?: VehicleDTO): void {
    if (this.busy()) return;
    const modalRef = this.modal.open(VehicleAddDialog, {
      centered: true,
      ariaLabelledBy: 'vehicle-editor-title',
      windowClass: 'aurum-vehicle-modal',
      beforeDismiss: () => !modalRef.componentInstance.isSubmitting(),
    });
    modalRef.componentInstance.vehicle = vehicle;
    void modalRef.result.then(
      (message: string) => {
        this.notice.set(message);
        this.vehicles.reload();
      },
      () => {},
    );
  }

  async deleteVehicle(publicId: string): Promise<void> {
    if (this.busy()) return;
    this.deleting.set(publicId);
    this.deleteError.set('');
    this.notice.set('');
    try {
      const response = await this.vehicleService.deleteVehicle(publicId);
      if (response.status < 200 || response.status >= 300) {
        this.deleteError.set(response.message || 'Unable to delete vehicle. Please try again.');
        return;
      }
      this.notice.set('Vehicle deleted.');
      const page = this.page();
      if (page?.content.length === 1 && page.pageNumber > 0) {
        this.updateQuery({ page: page.pageNumber - 1 }, false);
      } else {
        this.vehicles.reload();
      }
      this.refreshingAfterDelete.set(true);
    } catch (error) {
      this.deleteError.set(
        getRequestErrorMessage(error, 'Unable to delete vehicle. Please try again.'),
      );
    } finally {
      this.deleting.set(undefined);
    }
  }
}
