import { StringFormatterService } from '../../../services/string-formatter-service';
import { Component, input, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientQuery } from '../../../services/client-service';
@Component({
  selector: 'app-clients-sorting',
  imports: [FormsModule],
  templateUrl: './clients-sorting.html',
  styleUrl: './clients-sorting.scss',
})
export class ClientsSorting {
  readonly stringFormatter = inject(StringFormatterService);
  readonly query = input<ClientQuery>({});
  readonly disabled = input(false);
  readonly changed = output<Pick<ClientQuery, 'sortBy' | 'sortDirection'>>();

  readonly fields = ['name', 'email', 'phone'];
  readonly label = (field: string) =>
    this.stringFormatter
      .human(field.replace(/([A-Z])/g, ' $1'))
      .replace(/^./, (character) => character.toUpperCase());
  sort(field: string, direction: string) {
    if (this.disabled()) return;
    this.changed.emit({ sortBy: field, sortDirection: field ? direction : '' });
  }
}
