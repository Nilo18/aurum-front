import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CuisineType, MenuItemCategory, MenuItemQuery } from '../../../services/menu-service';
import { human } from '../shared/staff-format';
@Component({
  selector: 'app-menu-filtering',
  imports: [FormsModule],
  templateUrl: './menu-filtering.html',
  styleUrl: './menu-filtering.scss',
})
export class MenuFiltering {
  readonly query = input<MenuItemQuery>({});
  readonly disabled = input(false);
  readonly changed = output<Pick<MenuItemQuery, 'category' | 'type' | 'priceFrom' | 'priceTo'>>();
  readonly categories: MenuItemCategory[] = ['APPETIZER', 'MAIN_COURSE', 'DESSERT', 'DRINK'];
  readonly cuisines = Object.values(CuisineType);
  readonly human = human;
  filter(changes: Partial<MenuItemQuery>) {
    const { category, type, priceFrom, priceTo } = this.query();
    this.changed.emit({ category, type, priceFrom, priceTo, ...changes });
  }
}
