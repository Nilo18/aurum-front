import { Component, inject, input, linkedSignal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { human } from '../shared/staff-format';
import {
  EventService,
  EventQuery,
  EventDTO,
  PageResponse,
  EventFilterKey,
  EventType,
  EventLocation,
  EventStatus,
} from '../../../services/event-service';
@Component({
  selector: 'app-event-filtering',
  imports: [FormsModule],
  templateUrl: './event-filtering.html',
  styleUrl: './event-filtering.scss',
})
export class EventFiltering {
  readonly query = input<EventQuery>({});
  readonly disabled = input(false);
  readonly started = output<void>();
  readonly changed = output<PageResponse<EventDTO>>();
  readonly failed = output<void>();
  private readonly service = inject(EventService);

  readonly draft = linkedSignal(() => ({ ...this.query() }));
  readonly types = Object.values(EventType);
  readonly locations = Object.values(EventLocation);
  readonly statuses = Object.values(EventStatus);
  readonly human = human;
  async filter<K extends EventFilterKey>(field: K, value: EventQuery[K] | null) {
    if (this.disabled()) return;
    const normalized = value === null || value === '' ? undefined : value;
    this.draft.update((query) => ({ ...query, [field]: normalized }));
    this.started.emit();
    try {
      this.changed.emit(await this.service.filterEvents(field, normalized));
    } catch {
      this.failed.emit();
    }
  }
}
