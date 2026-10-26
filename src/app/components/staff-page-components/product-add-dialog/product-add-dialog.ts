import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Component, inject, OnInit, resource, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SupplierService } from '../../../services/supplier-service';
import {
  CreateProductRequest,
  ProductCategory,
  ProductDTO,
  ProductService,
} from '../../../services/product-service';
import { FormValidatorService } from '../../../services/form-validator-service';
import { getRequestErrorMessage } from '../../../services/request-error';

@Component({
  selector: 'app-product-add-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './product-add-dialog.html',
  styleUrl: './product-add-dialog.scss',
})
export class ProductAddDialog implements OnInit {
  readonly formValidator = inject(FormValidatorService);
  readonly modal = inject(NgbActiveModal);
  private readonly supplierService = inject(SupplierService);
  private readonly productService = inject(ProductService);
  private readonly fb = inject(FormBuilder);
  readonly isSubmitting = signal(false);
  readonly submissionError = signal('');
  readonly productForm = this.fb.group({
    productName: ['', [Validators.required, Validators.maxLength(200)]],
    category: [ProductCategory.FOOD_INGREDIENT, Validators.required],
    price: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.pattern(/^\d{1,10}(\.\d{1,2})?$/)],
    ],
    supplierId: [null as string | null, Validators.required],
    quantity: [null as number | null, [Validators.required, Validators.min(0)]],
  });
  readonly supplierNames = resource({ loader: () => this.supplierService.getSupplierNames() });
  readonly categories = Object.values(ProductCategory);
  product?: ProductDTO;

  private readonly formValues = toSignal(
    this.productForm.valueChanges.pipe(map(() => this.productForm.getRawValue())),
    { initialValue: this.productForm.getRawValue() },
  );

  hasChanges(): boolean {
    const original = this.product;
    if (!original) return true;
    const values = this.formValues();
    return (Object.keys(values) as (keyof typeof values)[]).some(
      (field) => values[field] !== original[field],
    );
  }
  ngOnInit(): void {
    if (this.product) {
      this.productForm.patchValue(this.product);
    }
  }

  close(): void {
    if (!this.isSubmitting()) this.modal.dismiss();
  }

  capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase().replace('_', ' ');
  }

  async save(): Promise<void> {
    if (this.isSubmitting() || !this.hasChanges()) return;
    this.submissionError.set('');
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    const values = this.productForm.getRawValue();
    const request: CreateProductRequest = {
      productName: values.productName!,
      category: values.category!,
      price: Number(values.price),
      supplierPublicId: values.supplierId!,
      quantity: Number(values.quantity),
    };
    this.isSubmitting.set(true);
    try {
      const response = this.product
        ? await this.productService.updateProduct({ ...request, publicId: this.product.publicId })
        : await this.productService.addProduct(request);
      if (!response?.publicId) {
        this.submissionError.set('The product could not be saved. Please try again.');
        return;
      }
      this.modal.close('Product saved.');
    } catch (error) {
      this.submissionError.set(
        getRequestErrorMessage(error, 'The product could not be saved. Please try again.'),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
