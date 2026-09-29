import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventService, EventQuery, EventDTO, PageResponse } from '../../../services/event-service';
@Component({
  selector: 'app-event-pagination',
  imports: [FormsModule],
  templateUrl: './event-pagination.html',
  styleUrl: './event-pagination.scss',
})
export class EventPagination {
  readonly query = input<EventQuery>({});
  readonly disabled = input(false);
  readonly started = output<void>();
  readonly changed = output<PageResponse<EventDTO>>();
  readonly failed = output<void>();
  private readonly service = inject(EventService);

  readonly page = input<PageResponse<EventDTO>>();
  readonly pageNumber = linkedSignal(() => this.page()?.pageNumber ?? 0);
  readonly size = linkedSignal(() => this.page()?.pageSize ?? this.query().size ?? 10);
  readonly total = computed(() => this.page()?.totalElements ?? 0);
  readonly pageCount = computed(() => Math.ceil(this.total() / this.size()));
  readonly first = computed(() => (this.total() ? this.pageNumber() * this.size() + 1 : 0));
  readonly last = computed(() => Math.min((this.pageNumber() + 1) * this.size(), this.total()));
  readonly pages = computed(() => {
    const start = Math.max(0, Math.min(this.pageNumber() - 2, this.pageCount() - 5));
    return Array.from({ length: Math.min(5, this.pageCount()) }, (_, i) => start + i);
  });
  async paginate(page: number, size = this.size()) {
    if (this.disabled() || page < 0 || (page > 0 && page >= this.pageCount())) return;
    const previousPage = this.pageNumber();
    const previousSize = this.size();
    this.pageNumber.set(page);
    this.size.set(size);
    this.started.emit();
    try {
      this.changed.emit(await this.service.paginateEvents(page, size));
    } catch {
      this.pageNumber.set(previousPage);
      this.size.set(previousSize);
      this.failed.emit();
    }
  }
}
