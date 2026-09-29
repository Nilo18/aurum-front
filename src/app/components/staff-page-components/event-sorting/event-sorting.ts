import { Component, inject, input, linkedSignal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { human } from '../shared/staff-format';
import { EventService, EventQuery, EventDTO, PageResponse } from '../../../services/event-service';
@Component({
  selector: 'app-event-sorting',
  imports: [FormsModule],
  templateUrl: './event-sorting.html',
  styleUrl: './event-sorting.scss',
})
export class EventSorting {
  readonly query = input<EventQuery>({});
  readonly disabled = input(false);
  readonly started = output<void>();
  readonly changed = output<PageResponse<EventDTO>>();
  readonly failed = output<void>();
  private readonly service = inject(EventService);

  readonly draft = linkedSignal(() => ({ ...this.query() }));
  readonly fields = [
    'clientName',
    // 'eventType',
    'date',
    'totalCost',
    'guestCount',
    // 'location',
    // 'status',
  ];
  readonly label = (field: string) =>
    human(field.replace(/([A-Z])/g, ' $1')).replace(/^./, (character) => character.toUpperCase());
  async sort(field: string, direction: string) {
    if (this.disabled()) return;
    this.draft.update((query) => ({ ...query, sortBy: field, sortDirection: direction }));
    this.started.emit();
    try {
      this.changed.emit(await this.service.sortEvents(field, field ? direction : ''));
    } catch {
      this.failed.emit();
    }
  }
}
