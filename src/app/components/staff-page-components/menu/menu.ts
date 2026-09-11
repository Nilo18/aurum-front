import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StaffPreviewStore } from '../shared/staff-preview-store';
import { Row } from '../shared/staff-row';
import { human, currency } from '../shared/staff-format';

@Component({
  selector: 'app-menu',
  imports: [FormsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  readonly store = inject(StaffPreviewStore);
  readonly human = human;
  readonly currency = currency;
  readonly search = signal('');
  readonly filter = signal('');
  readonly editor = signal(false);
  readonly notice = signal('');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('editorDialog');
  readonly rows = computed(() => this.store.data().menu);
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

  private searchValue(key: string, value: unknown): string {
    if (key === 'pricePerPerson') return this.currency(value);
    return human(value);
  }

  open(row?: Row): void {
    this.editing = row;
    this.draft = row
      ? { ...row }
      : {
          name: '',
          category: 'APPETIZER',
          pricePerPerson: '',
        };
    this.editor.set(true);
  }

  close(): void {
    this.editor.set(false);
  }

  save(): void {
    const row = { ...this.draft };
    row['pricePerPerson'] = Number(row['pricePerPerson']);
    this.store.save('menu', row, this.editing);
    this.close();
    this.notice.set('Menu item saved in this preview session.');
  }
}
