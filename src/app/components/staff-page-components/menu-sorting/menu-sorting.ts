import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItemQuery } from '../../../services/menu-service';
import { human } from '../shared/staff-format';
@Component({
  selector: 'app-menu-sorting',
  imports: [FormsModule],
  templateUrl: './menu-sorting.html',
  styleUrl: './menu-sorting.scss',
})
export class MenuSorting {
  readonly query = input<MenuItemQuery>({});
  readonly disabled = input(false);
  readonly changed = output<Pick<MenuItemQuery, 'sortBy' | 'sortDirection'>>();
  readonly fields = ['name', 'category', 'type', 'pricePerPerson', 'publicId'];
  readonly human = human;
  sort(sortBy: string, sortDirection: string) {
    this.changed.emit({ sortBy, sortDirection: sortBy ? sortDirection : '' });
  }
}
