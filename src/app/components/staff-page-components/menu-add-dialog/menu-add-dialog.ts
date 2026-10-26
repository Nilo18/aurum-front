import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { StringFormatterService } from '../../../services/string-formatter-service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidatorService } from '../../../services/form-validator-service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CreateMenuItemRequest,
  CuisineType,
  MenuItemCategory,
  MenuItemDTO,
  MenuService,
} from '../../../services/menu-service';
import { getRequestErrorMessage } from '../../../services/request-error';

@Component({
  selector: 'app-menu-add-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './menu-add-dialog.html',
  styleUrl: './menu-add-dialog.scss',
})
export class MenuAddDialog implements OnInit {
  readonly stringFormatter = inject(StringFormatterService);
  readonly modal = inject(NgbActiveModal);
  private readonly menuService = inject(MenuService);
  readonly formValidator = inject(FormValidatorService);
  private readonly fb = inject(FormBuilder);
  readonly categories: MenuItemCategory[] = ['APPETIZER', 'MAIN_COURSE', 'DESSERT', 'DRINK'];
  readonly cuisines = Object.values(CuisineType);
  readonly isSubmitting = signal(false);
  readonly submissionError = signal('');
  menuItem?: MenuItemDTO;
  readonly menuForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/\S/)]],
    category: ['APPETIZER' as MenuItemCategory, Validators.required],
    type: [CuisineType.GENERAL, Validators.required],
    pricePerPerson: [
      null as number | null,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(99999999.99),
        Validators.pattern(/^\d+(\.\d{1,2})?$/),
      ],
    ],
  });

  private readonly formValues = toSignal(
    this.menuForm.valueChanges.pipe(map(() => this.menuForm.getRawValue())),
    { initialValue: this.menuForm.getRawValue() },
  );

  hasChanges(): boolean {
    const original = this.menuItem;
    if (!original) return true;
    const values = this.formValues();
    return (Object.keys(values) as (keyof typeof values)[]).some(
      (field) => values[field] !== original[field],
    );
  }
  ngOnInit(): void {
    if (this.menuItem) {
      this.menuForm.patchValue({
        name: this.menuItem.name,
        category: this.menuItem.category,
        type: this.menuItem.type,
        pricePerPerson: this.menuItem.pricePerPerson,
      });
    }
  }

  close(): void {
    if (!this.isSubmitting()) this.modal.dismiss();
  }

  async save(): Promise<void> {
    if (this.isSubmitting() || !this.hasChanges()) return;
    this.submissionError.set('');
    if (this.menuForm.invalid) {
      this.menuForm.markAllAsTouched();
      return;
    }
    const values = this.menuForm.getRawValue();
    const request: CreateMenuItemRequest = {
      ...values,
      pricePerPerson: Number(values.pricePerPerson),
    };
    this.isSubmitting.set(true);
    try {
      const response = this.menuItem
        ? await this.menuService.updateMenuItem({
            ...request,
            publicId: this.menuItem.publicId,
          })
        : await this.menuService.addMenuItem(request);
      if (!response?.publicId) {
        this.submissionError.set('The menu item could not be saved. Please try again.');
        return;
      }
      this.modal.close('Menu item saved.');
    } catch (error) {
      this.submissionError.set(
        getRequestErrorMessage(error, 'The menu item could not be saved. Please try again.'),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
