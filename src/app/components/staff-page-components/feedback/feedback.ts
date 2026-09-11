import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StaffPreviewStore } from '../shared/staff-preview-store';
import { Row } from '../shared/staff-row';
import { human } from '../shared/staff-format';

@Component({
  selector: 'app-feedback',
  imports: [FormsModule],
  templateUrl: './feedback.html',
  styleUrl: './feedback.scss',
})
export class Feedback {
  readonly store = inject(StaffPreviewStore);
  readonly human = human;

  readonly search = signal('');
  readonly filter = signal('');
  readonly editor = signal(false);
  readonly notice = signal('');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('editorDialog');
  readonly rows = computed(() => this.store.data().feedback);
  readonly filters = computed(() =>
    Array.from(new Set(this.rows().map((row) => String(row['rating'])))),
  );
  readonly filtered = computed(() =>
    this.rows().filter(
      (row) =>
        (!this.filter() || String(row['rating']) === this.filter()) &&
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

  ratingLabel(value: unknown): string {
    return '★'.repeat(Number(value)) + ' · ' + value + '/5';
  }

  private searchValue(key: string, value: unknown): string {
    if (key === 'rating') return this.ratingLabel(value);
    return human(value);
  }

  open(row?: Row): void {
    this.editing = row;
    this.draft = row
      ? { ...row }
      : {
          eventId: '',
          author: '',
          commentDate: '',
          rating: '1',
          description: '',
        };
    this.editor.set(true);
  }

  close(): void {
    this.editor.set(false);
  }

  save(): void {
    const row = { ...this.draft };
    row['eventId'] = Number(row['eventId']);
    row['rating'] = Number(row['rating']);
    this.store.save('feedback', row, this.editing);
    this.close();
    this.notice.set('Feedback saved in this preview session.');
  }
}
