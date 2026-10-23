import { StringFormatterService } from '../../../services/string-formatter-service';
import { Component, input, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItemQuery } from '../../../services/menu-service';
@Component({
  selector: 'app-menu-sorting',
  imports: [FormsModule],
  templateUrl: './menu-sorting.html',
  styleUrl: './menu-sorting.scss',
})
export class MenuSorting {
  readonly stringFormatter = inject(StringFormatterService);
  readonly query = input<MenuItemQuery>({});
  readonly disabled = input(false);
  readonly changed = output<Pick<MenuItemQuery, 'sortBy' | 'sortDirection'>>();
  readonly fields = ['name', 'category', 'type', 'pricePerPerson', 'publicId'];
  sort(sortBy: string, sortDirection: string) {
    this.changed.emit({ sortBy, sortDirection: sortBy ? sortDirection : '' });
  }
}
