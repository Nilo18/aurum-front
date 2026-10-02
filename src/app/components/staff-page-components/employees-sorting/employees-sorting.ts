import { Component, inject, input, linkedSignal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { human } from '../shared/staff-format';
import { EmployeeService, EmployeeQuery, EmployeeDTO } from '../../../services/employee-service';
import { PageResponse } from '../../../services/event-service';
@Component({
  selector: 'app-employees-sorting',
  imports: [FormsModule],
  templateUrl: './employees-sorting.html',
  styleUrl: './employees-sorting.scss',
})
export class EmployeesSorting {
  readonly query = input<EmployeeQuery>({});
  readonly disabled = input(false);
  readonly started = output<void>();
  readonly changed = output<PageResponse<EmployeeDTO>>();
  readonly failed = output<void>();
  private readonly service = inject(EmployeeService);

  readonly draft = linkedSignal(() => ({ ...this.query() }));
  readonly fields = ['name', 'email', 'salary', 'specialty', 'role', 'status'];
  readonly label = (field: string) =>
    human(field.replace(/([A-Z])/g, ' $1')).replace(/^./, (character) => character.toUpperCase());
  async sort(field: string, direction: string) {
    if (this.disabled()) return;
    this.draft.update((query) => ({ ...query, sortBy: field, sortDirection: direction }));
    this.started.emit();
    try {
      this.changed.emit(await this.service.sortEmployees(field, field ? direction : ''));
    } catch {
      this.failed.emit();
    }
  }
}
