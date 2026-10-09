import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { human } from '../shared/staff-format';
import { ClientQuery } from '../../../services/client-service';
@Component({
  selector: 'app-clients-sorting',
  imports: [FormsModule],
  templateUrl: './clients-sorting.html',
  styleUrl: './clients-sorting.scss',
})
export class ClientsSorting {
  readonly query = input<ClientQuery>({});
  readonly disabled = input(false);
  readonly changed = output<Pick<ClientQuery, 'sortBy' | 'sortDirection'>>();

  readonly fields = ['name', 'email', 'phone'];
  readonly label = (field: string) =>
    human(field.replace(/([A-Z])/g, ' $1')).replace(/^./, (character) => character.toUpperCase());
  sort(field: string, direction: string) {
    if (this.disabled()) return;
    this.changed.emit({ sortBy: field, sortDirection: field ? direction : '' });
  }
}
