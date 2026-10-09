import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  EmployeeQuery,
  EmployeeType,
  EmployeeRole,
  EmployeeStatus,
} from '../../../services/employee-service';
import { human } from '../shared/staff-format';
@Component({
  selector: 'app-employees-filtering',
  imports: [FormsModule],
  templateUrl: './employees-filtering.html',
  styleUrl: './employees-filtering.scss',
})
export class EmployeesFiltering {
  readonly query = input<EmployeeQuery>({});
  readonly disabled = input(false);
  readonly changed = output<Pick<EmployeeQuery, 'type' | 'role' | 'status'>>();
  readonly types = Object.keys(EmployeeType).filter((key) => Number.isNaN(Number(key)));
  readonly roles = Object.keys(EmployeeRole).filter((key) => Number.isNaN(Number(key)));
  readonly statuses = Object.keys(EmployeeStatus).filter((key) => Number.isNaN(Number(key)));
  readonly human = human;
  filter(field: 'type' | 'role' | 'status', value?: string) {
    if (this.disabled()) return;
    this.changed.emit({ [field]: value || undefined } as Pick<
      EmployeeQuery,
      'type' | 'role' | 'status'
    >);
  }
}
