import { StaffPreviewStore } from '../shared/staff-preview-store';
import { Row } from '../shared/staff-row';
import {
  Component,
  computed,
  inject,
  resource,
  signal,
  effect,
  ElementRef,
  viewChild,
} from '@angular/core';
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
  readonly human = human;
  readonly query = this.service.getClientQuery();
  readonly search = signal(this.query().search ?? '');
  readonly pending = signal(false);
  readonly error = signal('');
  readonly clients = resource({ loader: () => this.service.getClients() });
  readonly busy = computed(() => this.pending() || this.clients.isLoading());
  readonly page = computed(() => (this.clients.hasValue() ? this.clients.value() : undefined));
  readonly rows = computed<Row[]>(() =>
    (this.page()?.content ?? []).map((row) => ({ ...row, type: row.clientType })),
  );
  readonly store = inject(StaffPreviewStore);
  readonly editor = signal(false);
  readonly notice = signal('');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('editorDialog');
  editing?: Row;
  draft: Row = {};
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
  constructor() {
    effect(() => {
      const dialog = this.dialog()?.nativeElement;
      if (dialog && !dialog.open) dialog.showModal();
    });
  }

  open(row?: Row): void {
    this.editing = row;
    this.draft = row
      ? { ...row }
      : {
          name: '',
          email: '',
          phone: '',
          type: 'PERSON',
        };
    this.editor.set(true);
  }

  close(): void {
    this.editor.set(false);
  }

  save(): void {
    const row = { ...this.draft };

    this.store.save('clients', row, this.editing);
    this.close();
    this.notice.set('Client saved in the preview store only. The live collection is unchanged.');
  }
}
