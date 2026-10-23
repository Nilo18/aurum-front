import { StringFormatterService } from '../../../services/string-formatter-service';
import { Component, input, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventQuery, PageResponse } from '../../../services/event-service';
@Component({
  selector: 'app-event-sorting',
  imports: [FormsModule],
  templateUrl: './event-sorting.html',
  styleUrl: './event-sorting.scss',
})
export class EventSorting {
  readonly stringFormatter = inject(StringFormatterService);
  readonly query = input<EventQuery>({});
  readonly disabled = input(false);
  readonly changed = output<Pick<EventQuery, 'sortBy' | 'sortDirection'>>();

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
    this.stringFormatter
      .human(field.replace(/([A-Z])/g, ' $1'))
      .replace(/^./, (character) => character.toUpperCase());
  sort(field: string, direction: string) {
    if (this.disabled()) return;
    this.changed.emit({ sortBy: field, sortDirection: field ? direction : '' });
  }
}
