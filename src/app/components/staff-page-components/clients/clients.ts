import { Component, computed, inject, resource, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmActionModal } from '../../general-components/confirm-action-modal/confirm-action-modal';
import { getRequestErrorMessage } from '../../../services/request-error';
import { FormsModule } from '@angular/forms';
import { human } from '../shared/staff-format';
import { ClientService, ClientDTO } from '../../../services/client-service';
import { PageResponse } from '../../../services/event-service';
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
  readonly query = this.service.getClientQuery();
  readonly search = signal(this.query().search ?? '');
  readonly pending = signal(false);
  readonly error = signal('');
  readonly clients = resource({ loader: () => this.service.getClients() });
  readonly busy = computed(
    () => this.pending() || this.clients.isLoading() || this.confirming() || !!this.deleting(),
  );
  readonly page = computed(() => (this.clients.hasValue() ? this.clients.value() : undefined));
  readonly rows = computed(() =>
    (this.page()?.content ?? []).map((row) => ({ ...row, type: row.clientType })),
  );
  readonly notice = signal('');

  start() {
    this.pending.set(true);
    this.error.set('');
  }
  receive(page: PageResponse<ClientDTO>) {
    this.clients.set(page);
    this.pending.set(false);
  }
  fail() {
    this.pending.set(false);
    this.error.set('Unable to load clients. Please try again.');
  }
  async searchClients() {
    if (this.busy()) return;
    this.search.set(this.search().trim());
    this.start();
    try {
      this.receive(await this.service.searchClients(this.search()));
    } catch {
      this.fail();
    }
  }
  async retry() {
    if (this.busy()) return;
    this.start();
    try {
      this.receive(await this.service.getClients());
    } catch {
      this.fail();
    }
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
      try {
        const currentPage = this.page();
        const page =
          currentPage && !currentPage.content.length && currentPage.pageNumber > 0
            ? await this.service.paginateClients(currentPage.pageNumber - 1)
            : await this.service.getClients();
        this.receive(page);
        this.error.set('');
      } catch {
        this.error.set('Client deleted, but the list could not be refreshed. Please retry.');
      }
    } catch (error) {
      this.deleteError.set(
        getRequestErrorMessage(error, 'Unable to delete client. Please try again.'),
      );
    } finally {
      this.deleting.set(undefined);
    }
  }
}
