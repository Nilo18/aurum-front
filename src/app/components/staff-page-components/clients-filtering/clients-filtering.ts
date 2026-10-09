import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientQuery, ClientType } from '../../../services/client-service';
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
  readonly changed = output<Pick<ClientQuery, 'type'>>();
  readonly types = Object.values(ClientType);
  readonly human = human;
  filter(type?: ClientType) {
    if (!this.disabled()) this.changed.emit({ type });
  }
}
