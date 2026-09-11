import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StaffPreviewStore } from '../shared/staff-preview-store';
import { Row } from '../shared/staff-row';
import { human, currency } from '../shared/staff-format';

@Component({
  selector: 'app-products',
  imports: [FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  readonly store = inject(StaffPreviewStore);
  readonly human = human;
  readonly currency = currency;
  readonly search = signal('');
  readonly filter = signal('');
  readonly editor = signal(false);
  readonly notice = signal('');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('editorDialog');
  readonly rows = computed(() => this.store.data().products);
  readonly filters = computed(() =>
    Array.from(new Set(this.rows().map((row) => String(row['category'])))),
  );
  readonly filtered = computed(() =>
    this.rows().filter(
      (row) =>
        (!this.filter() || String(row['category']) === this.filter()) &&
        Object.entries(row).some(([key, value]) =>
          this.searchValue(key, value).toLowerCase().includes(this.search().toLowerCase()),
        ),
    ),
  );
  editing?: Row;
  draft: Row = {};

  constructor() {
    effect(() => {
      const dialog = this.dialog()?.nativeElement;
      if (dialog && !dialog.open) dialog.showModal();
    });
  }

  supplierName(value: unknown): string {
    return String(
      this.store.data().suppliers.find((row) => row['id'] === Number(value))?.['partnerNumber'] ??
        `Supplier #${value}`,
    );
  }

  private searchValue(key: string, value: unknown): string {
    if (key === 'price') return this.currency(value);
    if (key === 'supplierId') return this.supplierName(value);
    return human(value);
  }

  open(row?: Row): void {
    this.editing = row;
    this.draft = row
      ? { ...row }
      : {
          productName: '',
          category: '',
          price: '',
          supplierId: '',
          quantity: '',
        };
    this.editor.set(true);
  }

  close(): void {
    this.editor.set(false);
  }

  save(): void {
    const row = { ...this.draft };
    row['price'] = Number(row['price']);
    row['supplierId'] = Number(row['supplierId']);
    row['quantity'] = Number(row['quantity']);
    this.store.save('products', row, this.editing);
    this.close();
    this.notice.set('Product saved in this preview session.');
  }
}
