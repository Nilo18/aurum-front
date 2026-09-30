import { Component, inject, input, linkedSignal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { human } from '../shared/staff-format';
import { ClientService, ClientQuery, ClientDTO } from '../../../services/client-service';
import { PageResponse } from '../../../services/event-service';
@Component({
  selector: 'app-clients-sorting',
  imports: [FormsModule],
  templateUrl: './clients-sorting.html',
  styleUrl: './clients-sorting.scss',
})
export class ClientsSorting {
  readonly query = input<ClientQuery>({});
  readonly disabled = input(false);
  readonly started = output<void>();
  readonly changed = output<PageResponse<ClientDTO>>();
  readonly failed = output<void>();
  private readonly service = inject(ClientService);

  readonly draft = linkedSignal(() => ({ ...this.query() }));
  readonly fields = ['name', 'email', 'phone'];
  readonly label = (field: string) =>
    human(field.replace(/([A-Z])/g, ' $1')).replace(/^./, (character) => character.toUpperCase());
  async sort(field: string, direction: string) {
    if (this.disabled()) return;
    this.draft.update((query) => ({ ...query, sortBy: field, sortDirection: direction }));
    this.started.emit();
    try {
      this.changed.emit(await this.service.sortClients(field, field ? direction : ''));
    } catch {
      this.failed.emit();
    }
  }
}
