import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { human } from '../shared/staff-format';
import { EmployeeQuery } from '../../../services/employee-service';
@Component({
  selector: 'app-employees-sorting',
  imports: [FormsModule],
  templateUrl: './employees-sorting.html',
  styleUrl: './employees-sorting.scss',
})
export class EmployeesSorting {
  readonly query = input<EmployeeQuery>({});
  readonly disabled = input(false);
  readonly changed = output<Pick<EmployeeQuery, 'sortBy' | 'sortDirection'>>();

  readonly fields = ['name', 'email', 'salary', 'specialty', 'role', 'status'];
  readonly label = (field: string) =>
    human(field.replace(/([A-Z])/g, ' $1')).replace(/^./, (character) => character.toUpperCase());
  sort(field: string, direction: string) {
    if (this.disabled()) return;
    this.changed.emit({ sortBy: field, sortDirection: field ? direction : '' });
  }
}
