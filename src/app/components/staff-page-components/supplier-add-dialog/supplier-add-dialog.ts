import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { StringFormatterService } from '../../../services/string-formatter-service';
import { Component, inject, OnInit, resource, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidatorService } from '../../../services/form-validator-service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CreateSupplierRequest,
  ProductCategory,
  SupplierDTO,
  SupplierService,
} from '../../../services/supplier-service';
import { getRequestErrorMessage } from '../../../services/request-error';

@Component({
  selector: 'app-supplier-add-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './supplier-add-dialog.html',
  styleUrl: './supplier-add-dialog.scss',
})
export class SupplierAddDialog implements OnInit {
  readonly stringFormatter = inject(StringFormatterService);
  readonly modal = inject(NgbActiveModal);
  private readonly supplierService = inject(SupplierService);
  readonly formValidator = inject(FormValidatorService);
  private readonly fb = inject(FormBuilder);
  readonly productCategories = Object.values(ProductCategory);
  availableProductCategories = resource({
    loader: async () => {
      if (this.supplier) {
        return;
      }
      const res = await this.supplierService.getAvailableProductCategories();
      return res;
    },
  });
  readonly isSubmitting = signal(false);
  readonly submissionError = signal('');
  supplier?: SupplierDTO;
  readonly supplierForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    city: ['', Validators.required],
    street: ['', Validators.required],
    number: ['', Validators.required],
    categories: [new Set<ProductCategory>()],
  });

  private readonly formValues = toSignal(
    this.supplierForm.valueChanges.pipe(map(() => this.supplierForm.getRawValue())),
    { initialValue: this.supplierForm.getRawValue() },
  );

  hasChanges(): boolean {
    const original = this.supplier;
    if (!original) return true;
    const values = this.formValues();
    return (Object.keys(values) as (keyof typeof values)[]).some((field) => {
      if (field === 'categories') {
        return (
          values.categories.size !== original.categories.size ||
          [...values.categories].some((category) => !original.categories.has(category))
        );
      }
      return values[field] !== original[field];
    });
  }
  ngOnInit(): void {
    if (this.supplier) {
      this.supplierForm.patchValue({
        name: this.supplier.name,
        city: this.supplier.city,
        street: this.supplier.street,
        number: this.supplier.number,
        categories: new Set(this.supplier.categories),
      });
    }
  }

  toggleCategory(category: ProductCategory, selected: boolean): void {
    const categories = new Set(this.supplierForm.controls.categories.value);
    if (selected) categories.add(category);
    else categories.delete(category);
    this.supplierForm.controls.categories.setValue(categories);
    this.supplierForm.controls.categories.markAsDirty();
    this.supplierForm.controls.categories.markAsTouched();
  }

  close(): void {
    if (!this.isSubmitting()) this.modal.dismiss();
  }

  async save(): Promise<void> {
    if (this.isSubmitting() || !this.hasChanges()) return;
    this.submissionError.set('');
    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      return;
    }
    const request: CreateSupplierRequest = this.supplierForm.getRawValue();
    this.isSubmitting.set(true);
    try {
      const response = this.supplier
        ? await this.supplierService.updateSupplier({
            ...request,
            publicId: this.supplier.publicId,
          })
        : await this.supplierService.addSupplier(request);
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
