import { StringFormatterService } from '../../../services/string-formatter-service';
import { Component, input, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientQuery, ClientType } from '../../../services/client-service';
@Component({
  selector: 'app-clients-filtering',
  imports: [FormsModule],
  templateUrl: './clients-filtering.html',
  styleUrl: './clients-filtering.scss',
})
export class ClientsFiltering {
  readonly stringFormatter = inject(StringFormatterService);
  readonly query = input<ClientQuery>({});
  readonly disabled = input(false);
  readonly changed = output<Pick<ClientQuery, 'type'>>();
  readonly types = Object.values(ClientType);
  filter(type?: ClientType) {
    if (!this.disabled()) this.changed.emit({ type });
  }
}
