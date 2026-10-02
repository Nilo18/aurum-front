import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  EmployeeService,
  EmployeeQuery,
  EmployeeDTO,
  EmployeeType,
  EmployeeRole,
  EmployeeStatus,
} from '../../../services/employee-service';
import { PageResponse } from '../../../services/event-service';
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
  readonly started = output<void>();
  readonly changed = output<PageResponse<EmployeeDTO>>();
  readonly failed = output<void>();
  readonly types = Object.keys(EmployeeType).filter((key) => Number.isNaN(Number(key)));
  readonly roles = Object.keys(EmployeeRole).filter((key) => Number.isNaN(Number(key)));
  readonly statuses = Object.keys(EmployeeStatus).filter((key) => Number.isNaN(Number(key)));
  readonly human = human;
  private readonly service = inject(EmployeeService);
  async filter(field: 'type' | 'role' | 'status', value?: string) {
    if (this.disabled()) return;
    this.started.emit();
    try {
      this.changed.emit(await this.service.filterEmployees({ [field]: value } as EmployeeQuery));
    } catch {
      this.failed.emit();
    }
  }
}
