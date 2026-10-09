import { rxResource } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmActionModal } from '../../general-components/confirm-action-modal/confirm-action-modal';
import { getRequestErrorMessage } from '../../../services/request-error';
import { FormsModule } from '@angular/forms';
import { human } from '../shared/staff-format';
import { ClientService, ClientQuery } from '../../../services/client-service';
import { ClientsFiltering } from '../clients-filtering/clients-filtering';
import { ClientsSorting } from '../clients-sorting/clients-sorting';
import { ClientsPagination } from '../clients-pagination/clients-pagination';
@Component({
  selector: 'app-clients',
  imports: [FormsModule, ClientsFiltering, ClientsSorting, ClientsPagination],
  templateUrl: './clients.html',
  styleUrl: './clients.scss',
})
export class Clients {
  private readonly service = inject(ClientService);
  private readonly modal = inject(NgbModal);
  readonly confirming = signal(false);
  readonly deleting = signal<string | undefined>(undefined);
  readonly deleteError = signal('');
  readonly human = human;
  private readonly clientQuery = signal<ClientQuery>({
    page: 0,
    size: 10,
    search: '',
    sortBy: '',
    sortDirection: '',
  });
  readonly query = this.clientQuery.asReadonly();
  readonly search = signal(this.query().search ?? '');
  private readonly refreshingAfterDelete = signal(false);
  readonly error = computed(() =>
    this.clients.error()
      ? this.refreshingAfterDelete()
        ? 'Client deleted, but the list could not be refreshed. Please retry.'
        : 'Unable to load clients. Please try again.'
      : '',
  );
  readonly clients = rxResource({
    params: () => this.clientQuery(),
    stream: ({ params }) => this.service.getClients(params),
  });
  readonly busy = computed(
    () => this.clients.isLoading() || this.confirming() || !!this.deleting(),
  );
  readonly page = computed(() => (this.clients.hasValue() ? this.clients.value() : undefined));
  readonly rows = computed(() =>
    (this.page()?.content ?? []).map((row) => ({ ...row, type: row.clientType })),
  );
  readonly notice = signal('');

  updateQuery(changes: Partial<ClientQuery>, resetPage = true) {
    this.refreshingAfterDelete.set(false);
    this.clientQuery.update((query) => ({
      ...query,
      ...changes,
      ...(resetPage ? { page: 0 } : {}),
    }));
  }

  searchClients() {
    if (this.busy()) return;
    const search = this.search().trim();
    this.search.set(search);
    this.updateQuery({ search });
  }

  retry() {
    if (this.busy()) return;
    this.clients.reload();
  }

  async deleteClient(email: string): Promise<void> {
    if (this.busy()) return;
    this.confirming.set(true);
    const confirmation = this.modal.open(ConfirmActionModal, {
      centered: true,
      windowClass: 'aurum-confirm-action-modal',
      ariaLabelledBy: 'confirm-action-title',
      ariaDescribedBy: 'confirm-action-message',
    });
    confirmation.componentInstance.title = 'Delete client?';
    confirmation.componentInstance.msg = `Delete ${email} from the client collection? This action cannot be undone.`;
    try {
      if ((await confirmation.result) !== true) return;
    } catch {
      return;
    } finally {
      this.confirming.set(false);
    }

    this.deleting.set(email);
    this.deleteError.set('');
    this.notice.set('');
    try {
      const response = await this.service.deleteClient(email);
      if (response.status < 200 || response.status >= 300) {
        this.deleteError.set(response.message || 'Unable to delete client. Please try again.');
        return;
      }
      this.notice.set('Client deleted.');
      // Remove the deleted record immediately, even if the following refresh fails.
      const current = this.page();
      if (current) {
        this.clients.set({
          ...current,
          content: current.content.filter((client) => client.email !== email),
          totalElements: Math.max(0, current.totalElements - 1),
        });
      }
      const currentPage = this.page();
      if (currentPage && !currentPage.content.length && currentPage.pageNumber > 0) {
        this.updateQuery({ page: currentPage.pageNumber - 1 }, false);
      } else {
        this.clients.reload();
      }
      this.refreshingAfterDelete.set(true);
    } catch (error) {
      this.deleteError.set(
        getRequestErrorMessage(error, 'Unable to delete client. Please try again.'),
      );
    } finally {
      this.deleting.set(undefined);
    }
  }
}
