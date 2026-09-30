import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ClientService,
  ClientQuery,
  ClientDTO,
  ClientType,
} from '../../../services/client-service';
import { PageResponse } from '../../../services/event-service';
import { human } from '../shared/staff-format';
@Component({
  selector: 'app-clients-filtering',
  imports: [FormsModule],
  templateUrl: './clients-filtering.html',
  styleUrl: './clients-filtering.scss',
})
export class ClientsFiltering {
  readonly query = input<ClientQuery>({});
  readonly disabled = input(false);
  readonly started = output<void>();
  readonly changed = output<PageResponse<ClientDTO>>();
  readonly failed = output<void>();
  readonly types = Object.values(ClientType);
  readonly human = human;
  private readonly service = inject(ClientService);
  async filter(type?: ClientType) {
    if (this.disabled()) return;
    this.started.emit();
    try {
      this.changed.emit(await this.service.filterClients(type));
    } catch {
      this.failed.emit();
    }
  }
}
