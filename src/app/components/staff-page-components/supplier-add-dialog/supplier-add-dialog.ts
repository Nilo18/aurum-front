import { Component, inject, OnInit, resource, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CreateSupplierRequest,
  ProductCategory,
  SupplierDTO,
  SupplierService,
} from '../../../services/supplier-service';
import { getRequestErrorMessage } from '../../../services/request-error';
import { human } from '../shared/staff-format';

@Component({
  selector: 'app-supplier-add-dialog',
  imports: [FormsModule],
  templateUrl: './supplier-add-dialog.html',
  styleUrl: './supplier-add-dialog.scss',
})
export class SupplierAddDialog implements OnInit {
  readonly modal = inject(NgbActiveModal);
  private readonly supplierService = inject(SupplierService);
  readonly human = human;
  readonly productCategories = Object.values(ProductCategory);
  availableProductCategories = resource({
    loader: async () => {
      if (this.supplier) {
        return
      }
      const res = await this.supplierService.getAvailableProductCategories()
      return res
    }
  })
  readonly isSubmitting = signal(false);
  readonly submissionError = signal('');
  supplier?: SupplierDTO;
  draft: CreateSupplierRequest = {
    name: '',
    city: '',
    street: '',
    number: '',
    categories: new Set<ProductCategory>(),
  };

  ngOnInit(): void {
    if (this.supplier) {
      this.draft = {
        name: this.supplier.name,
        city: this.supplier.city,
        street: this.supplier.street,
        number: this.supplier.number,
        categories: new Set(this.supplier.categories),
      };
    }
  }

  toggleCategory(category: ProductCategory, selected: boolean): void {
    const categories = new Set(this.draft.categories);
    if (selected) categories.add(category);
    else categories.delete(category);
    this.draft = { ...this.draft, categories };
  }

  close(): void {
    if (!this.isSubmitting()) this.modal.dismiss();
  }

  async save(form: NgForm): Promise<void> {
    if (this.isSubmitting()) return;
    this.submissionError.set('');
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.submissionError.set('Please fill in all required fields.');
      return;
    }
    this.isSubmitting.set(true);
    try {
      const response = this.supplier
        ? await this.supplierService.updateSupplier({
            ...this.draft,
            publicId: this.supplier.publicId,
          })
        : await this.supplierService.addSupplier(this.draft);
      if (!response?.publicId) {
        this.submissionError.set('The supplier could not be saved. Please try again.');
        return;
      }
      this.modal.close('Supplier saved.');
    } catch (error) {
      this.submissionError.set(
        getRequestErrorMessage(error, 'The supplier could not be saved. Please try again.'),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
