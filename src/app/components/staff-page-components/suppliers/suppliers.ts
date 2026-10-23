import { StringFormatterService } from '../../../services/string-formatter-service';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SupplierAddDialog } from '../supplier-add-dialog/supplier-add-dialog';
import { SupplierDTO, SupplierQuery, SupplierService } from '../../../services/supplier-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { SupplierSorting } from '../supplier-sorting/supplier-sorting';
import { SupplierFiltering } from '../supplier-filtering/supplier-filtering';
import { SupplierPagination } from '../supplier-pagination/supplier-pagination';
import { getRequestErrorMessage } from '../../../services/request-error';

@Component({
  selector: 'app-suppliers',
  imports: [FormsModule, SupplierSorting, SupplierFiltering, SupplierPagination],
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.scss',
})
export class Suppliers {
  readonly stringFormatter = inject(StringFormatterService);
  private readonly modal = inject(NgbModal);
  private supplierService = inject(SupplierService);
  readonly supplierQuery = signal<SupplierQuery>({
    page: 0,
    size: 10,
    search: '',
    sortBy: '',
    sortDirection: '',
  });
  suppliers = rxResource({
    params: () => this.supplierQuery(),
    stream: ({ params }) => this.supplierService.getSuppliers(params),
  });

  readonly busy = computed(() => this.suppliers.isLoading() || this.deleting() !== undefined);
  readonly deleting = signal<string | undefined>(undefined);
  readonly search = signal('');
  readonly filter = signal('');
  readonly notice = signal('');
  readonly deleteError = signal('');

  updateQuery(changes: Partial<SupplierQuery>, resetPage = true) {
    this.supplierQuery.update((query) => ({
      ...query,
      ...changes,
      ...(resetPage ? { page: 0 } : {}),
    }));
  }

  open(supplier?: SupplierDTO): void {
    if (this.busy()) return;
    const modalRef = this.modal.open(SupplierAddDialog, {
      centered: true,
      ariaLabelledBy: 'supplier-editor-title',
      windowClass: 'aurum-supplier-modal',
      beforeDismiss: () => !modalRef.componentInstance.isSubmitting(),
    });
    modalRef.componentInstance.supplier = supplier;
    void modalRef.result.then(
      (message: string) => {
        this.notice.set(message);
        this.suppliers.reload();
      },
      () => {},
    );
  }

  async deleteSupplier(publicId: string): Promise<void> {
    if (this.busy()) return;
    this.deleting.set(publicId);
    this.deleteError.set('');
    this.notice.set('');
    try {
      const response = await this.supplierService.deleteSupplier(publicId);
      if (response.status < 200 || response.status >= 300) {
        this.deleteError.set(response.message || 'Unable to delete supplier. Please try again.');
        return;
      }
      this.notice.set('Supplier deleted.');
      const page = this.suppliers.value();
      if (page?.content.length === 1 && page.pageNumber > 0) {
        this.updateQuery({ page: page.pageNumber - 1 }, false);
      } else {
        this.suppliers.reload();
      }
    } catch (error) {
      this.deleteError.set(
        getRequestErrorMessage(error, 'Unable to delete supplier. Please try again.'),
      );
    } finally {
      this.deleting.set(undefined);
    }
  }
}
