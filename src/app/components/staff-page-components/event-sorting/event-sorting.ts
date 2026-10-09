import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { human } from '../shared/staff-format';
import { EventQuery, PageResponse } from '../../../services/event-service';
@Component({
  selector: 'app-event-sorting',
  imports: [FormsModule],
  templateUrl: './event-sorting.html',
  styleUrl: './event-sorting.scss',
})
export class EventSorting {
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
    human(field.replace(/([A-Z])/g, ' $1')).replace(/^./, (character) => character.toUpperCase());
  sort(field: string, direction: string) {
    if (this.disabled()) return;
    this.changed.emit({ sortBy: field, sortDirection: field ? direction : '' });
  }
}
