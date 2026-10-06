import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmActionModal } from '../../general-components/confirm-action-modal/confirm-action-modal';
import { getRequestErrorMessage } from '../../../services/request-error';
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
  private readonly modal = inject(NgbModal);
  readonly confirming = signal(false);
  readonly deleting = signal<number | undefined>(undefined);
  readonly deleteError = signal('');
  readonly notice = signal('');
  readonly human = human;
  readonly currency = currency;
  readonly query = this.service.getEventQuery().asReadonly();
  readonly search = signal(this.query().search ?? '');
  readonly pending = signal(false);
  readonly error = signal('');
  readonly events = resource({ loader: () => this.service.getEvents() });
  readonly busy = computed(
    () =>
      this.pending() ||
      this.events.isLoading() ||
      this.confirming() ||
      this.deleting() !== undefined,
  );
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

  async delete(id: number): Promise<void> {
    if (this.busy()) return;
    this.confirming.set(true);
    const confirmation = this.modal.open(ConfirmActionModal, {
      centered: true,
      windowClass: 'aurum-confirm-action-modal',
      ariaLabelledBy: 'confirm-action-title',
      ariaDescribedBy: 'confirm-action-message',
    });
    confirmation.componentInstance.title = 'Delete event?';
    confirmation.componentInstance.msg = `Delete #${id} from the event collection? This action cannot be undone.`;
    try {
      if ((await confirmation.result) !== true) return;
    } catch {
      return;
    } finally {
      this.confirming.set(false);
    }

    this.deleting.set(id);
    this.deleteError.set('');
    this.notice.set('');
    try {
      const response = await this.service.deleteEvent(id);
      if (response.status < 200 || response.status >= 300) {
        this.deleteError.set(response.message || 'Unable to delete event. Please try again.');
        return;
      }
      this.notice.set('Event deleted.');
      // Remove the deleted record immediately, even if the following refresh fails.
      const current = this.page();
      if (current) {
        this.events.set({
          ...current,
          content: current.content.filter((event) => event.id !== id),
          totalElements: Math.max(0, current.totalElements - 1),
        });
      }
      try {
        const currentPage = this.page();
        const page =
          currentPage && !currentPage.content.length && currentPage.pageNumber > 0
            ? await this.service.paginateEvents(currentPage.pageNumber - 1)
            : await this.service.getEvents();
        this.receive(page);
        this.error.set('');
      } catch {
        this.error.set('Event deleted, but the list could not be refreshed. Please retry.');
      }
    } catch (error) {
      this.deleteError.set(
        getRequestErrorMessage(error, 'Unable to delete event. Please try again.'),
      );
    } finally {
      this.deleting.set(undefined);
    }
  }
}
