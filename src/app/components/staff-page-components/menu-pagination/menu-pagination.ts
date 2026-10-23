import { Component, computed, input, output } from '@angular/core';
import { MenuItemDTO, MenuItemQuery } from '../../../services/menu-service';
import { PageResponse } from '../../../services/event-service';

@Component({
  selector: 'app-menu-pagination',
  imports: [],
  templateUrl: './menu-pagination.html',
  styleUrl: './menu-pagination.scss',
})
export class MenuPagination {
  readonly query = input<MenuItemQuery>({});
  readonly disabled = input(false);
  readonly changed = output<Pick<MenuItemQuery, 'page' | 'size'>>();

  readonly page = input<PageResponse<MenuItemDTO>>();
  readonly pageNumber = computed(() => this.query().page ?? 0);
  readonly size = computed(() => this.query().size ?? 10);
  readonly total = computed(() => this.page()?.totalElements ?? 0);
  readonly pageCount = computed(() => Math.ceil(this.total() / this.size()));
  readonly first = computed(() => (this.total() ? this.pageNumber() * this.size() + 1 : 0));
  readonly last = computed(() => Math.min((this.pageNumber() + 1) * this.size(), this.total()));
  readonly pages = computed(() => {
    const start = Math.max(0, Math.min(this.pageNumber() - 2, this.pageCount() - 5));
    return Array.from({ length: Math.min(5, this.pageCount()) }, (_, i) => start + i);
  });

  paginate(page: number, size = this.size()) {
    if (this.disabled() || page < 0 || (page > 0 && page >= this.pageCount())) return;
    this.changed.emit({ page, size });
  }
}
