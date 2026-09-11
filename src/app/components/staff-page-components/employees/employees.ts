import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StaffPreviewStore } from '../shared/staff-preview-store';
import { Row } from '../shared/staff-row';
import { human, currency } from '../shared/staff-format';

@Component({
  selector: 'app-employees',
  imports: [FormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
})
export class Employees {
  readonly store = inject(StaffPreviewStore);
  readonly human = human;
  readonly currency = currency;
  readonly search = signal('');
  readonly filter = signal('');
  readonly editor = signal(false);
  readonly notice = signal('');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('editorDialog');
  readonly rows = computed(() => this.store.data().employees);
  readonly filters = computed(() =>
    Array.from(new Set(this.rows().map((row) => String(row['type'])))),
  );
  readonly filtered = computed(() =>
    this.rows().filter(
      (row) =>
        (!this.filter() || String(row['type']) === this.filter()) &&
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

  private searchValue(key: string, value: unknown): string {
    if (key === 'salary') return this.currency(value);
    return human(value);
  }

  open(row?: Row): void {
    this.editing = row;
    this.draft = row
      ? { ...row }
      : {
          type: 'SALES_MANAGER',
          salary: '',
          email: '',
          role: 'ADMIN',
        };
    this.editor.set(true);
  }

  close(): void {
    this.editor.set(false);
  }

  save(): void {
    const row = { ...this.draft };
    row['salary'] = Number(row['salary']);
    this.store.save('employees', row, this.editing);
    this.close();
    this.notice.set('Employee saved in this preview session.');
  }
}
