import { Component, computed, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { human, currency } from '../shared/staff-format';
import { EventService, EventDTO, PageResponse } from '../../../services/event-service';
import { EventFiltering } from '../event-filtering/event-filtering';
import { EventSorting } from '../event-sorting/event-sorting';
import { EventPagination } from '../event-pagination/event-pagination';
@Component({
  selector: 'app-events',
  imports: [FormsModule, EventFiltering, EventSorting, EventPagination],
  templateUrl: './events.html',
  styleUrl: './events.scss',
})
export class Events {
  private readonly service = inject(EventService);
  readonly human = human;
  readonly currency = currency;
  readonly query = this.service.getEventQuery().asReadonly();
  readonly search = signal(this.query().search ?? '');
  readonly pending = signal(false);
  readonly error = signal('');
  readonly events = resource({ loader: () => this.service.getEvents() });
  readonly busy = computed(() => this.pending() || this.events.isLoading());
  readonly page = computed(() => (this.events.hasValue() ? this.events.value() : undefined));
  readonly rows = computed(() => this.page()?.content ?? []);
  start() {
    this.pending.set(true);
    this.error.set('');
  }
  receive(page: PageResponse<EventDTO>) {
    this.events.set(page);
    this.pending.set(false);
  }
  fail() {
    this.pending.set(false);
    this.error.set('Unable to load events. Please try again.');
  }
  async searchEvents() {
    if (this.busy()) return;
    this.search.set(this.search().trim());
    this.start();
    try {
      this.receive(await this.service.searchEvents(this.search()));
    } catch {
      this.fail();
    }
  }
  async retry() {
    if (this.busy()) return;
    this.start();
    try {
      this.receive(await this.service.getEvents());
    } catch {
      this.fail();
    }
  }
}
