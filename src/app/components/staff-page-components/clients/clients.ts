import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StaffPreviewStore } from '../shared/staff-preview-store';
import { Row } from '../shared/staff-row';
import { human } from '../shared/staff-format';

@Component({
  selector: 'app-clients',
  imports: [FormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.scss',
})
export class Clients {
  readonly store = inject(StaffPreviewStore);
  readonly human = human;

  readonly search = signal('');
  readonly filter = signal('');
  readonly editor = signal(false);
  readonly notice = signal('');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('editorDialog');
  readonly rows = computed(() => this.store.data().clients);
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
    return human(value);
  }

  open(row?: Row): void {
    this.editing = row;
    this.draft = row
      ? { ...row }
      : {
          name: '',
          email: '',
          phone: '',
          type: 'PERSON',
        };
    this.editor.set(true);
  }

  close(): void {
    this.editor.set(false);
  }

  save(): void {
    const row = { ...this.draft };

    this.store.save('clients', row, this.editing);
    this.close();
    this.notice.set('Client saved in this preview session.');
  }
}
