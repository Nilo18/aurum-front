import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StaffPreviewStore } from '../shared/staff-preview-store';
import { Row } from '../shared/staff-row';
import { human, currency } from '../shared/staff-format';

@Component({
  selector: 'app-event-requests',
  imports: [FormsModule],
  templateUrl: './event-requests.html',
  styleUrl: './event-requests.scss',
})
export class EventRequests {
  readonly store = inject(StaffPreviewStore);
  readonly human = human;
  readonly currency = currency;
  readonly search = signal('');
  readonly filter = signal('');
  readonly editor = signal(false);
  readonly notice = signal('');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('editorDialog');
  readonly rows = computed(() =>
    this.store.data().events.filter((row) => row['status'] === 'REQUESTED'),
  );
  readonly filters = computed(() =>
    Array.from(new Set(this.rows().map((row) => String(row['status'])))),
  );
  readonly filtered = computed(() =>
    this.rows().filter(
      (row) =>
        (!this.filter() || String(row['status']) === this.filter()) &&
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

  clientName(value: unknown): string {
    return String(
      this.store.data().clients.find((row) => row['id'] === Number(value))?.['name'] ??
        `Client #${value}`,
    );
  }

  private searchValue(key: string, value: unknown): string {
    if (key === 'clientId') return this.clientName(value);
    if (key === 'totalCost') return this.currency(value);
    return human(value);
  }

  open(row?: Row): void {
    this.editing = row;
    this.draft = row
      ? { ...row }
      : {
          clientId: '',
          eventType: 'WEDDING',
          date: '',
          totalCost: '',
          guestCount: '',
          location: 'AURUM_BANQUET_HALL',
          status: 'REQUESTED',
          notes: '',
        };
    this.editor.set(true);
  }

  close(): void {
    this.editor.set(false);
  }

  save(): void {
    const row = { ...this.draft };
    row['clientId'] = Number(row['clientId']);
    row['totalCost'] = Number(row['totalCost']);
    row['guestCount'] = Number(row['guestCount']);
    this.store.save('events', row, this.editing);
    this.close();
    this.notice.set('Event saved in this preview session.');
  }
}
