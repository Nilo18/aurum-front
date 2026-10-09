import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { human } from '../shared/staff-format';
import {
  EventQuery,
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
  readonly changed = output<Pick<EventQuery, EventFilterKey>>();

  readonly types = Object.values(EventType);
  readonly locations = Object.values(EventLocation);
  readonly statuses = Object.values(EventStatus);
  readonly human = human;
  filter<K extends EventFilterKey>(field: K, value: EventQuery[K] | null) {
    if (this.disabled()) return;
    const normalized = value === null || value === '' ? undefined : value;
    if (typeof normalized === 'number' && (!Number.isFinite(normalized) || normalized < 0)) return;
    if (
      (field === 'guestFrom' || field === 'guestTo') &&
      typeof normalized === 'number' &&
      !Number.isInteger(normalized)
    )
      return;
    this.changed.emit({ [field]: normalized });
  }
}
