import { StringFormatterService } from '../../../services/string-formatter-service';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MenuAddDialog } from '../menu-add-dialog/menu-add-dialog';
import { MenuItemDTO, MenuItemQuery, MenuService } from '../../../services/menu-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { MenuSorting } from '../menu-sorting/menu-sorting';
import { MenuFiltering } from '../menu-filtering/menu-filtering';
import { MenuPagination } from '../menu-pagination/menu-pagination';
import { getRequestErrorMessage } from '../../../services/request-error';

@Component({
  selector: 'app-menu',
  imports: [FormsModule, MenuSorting, MenuFiltering, MenuPagination],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  readonly stringFormatter = inject(StringFormatterService);
  private readonly modal = inject(NgbModal);
  private menuService = inject(MenuService);
  readonly menuQuery = signal<MenuItemQuery>({
    page: 0,
    size: 10,
    search: '',
    sortBy: '',
    sortDirection: '',
  });
  readonly menu = rxResource({
    params: () => this.menuQuery(),
    stream: ({ params }) => this.menuService.getMenuItems(params),
  });

  readonly menuPage = computed(() => (this.menu.hasValue() ? this.menu.value() : undefined));
  readonly busy = computed(() => this.menu.isLoading() || this.deleting() !== undefined);
  readonly deleting = signal<string | undefined>(undefined);
  readonly notice = signal('');
  readonly deleteError = signal('');

  updateQuery(changes: Partial<MenuItemQuery>, resetPage = true) {
    this.menuQuery.update((query) => ({
      ...query,
      ...changes,
      ...(resetPage ? { page: 0 } : {}),
    }));
  }

  open(menuItem?: MenuItemDTO): void {
    if (this.busy()) return;
    const modalRef = this.modal.open(MenuAddDialog, {
      centered: true,
      ariaLabelledBy: 'menu-editor-title',
      windowClass: 'aurum-menu-modal',
      beforeDismiss: () => !modalRef.componentInstance.isSubmitting(),
    });
    modalRef.componentInstance.menuItem = menuItem;
    void modalRef.result.then(
      (message: string) => {
        this.notice.set(message);
        this.menu.reload();
      },
      () => {},
    );
  }

  async deleteMenuItem(publicId: string): Promise<void> {
    if (this.busy()) return;
    this.deleting.set(publicId);
    this.deleteError.set('');
    this.notice.set('');
    try {
      const response = await this.menuService.deleteMenuItem(publicId);
      if (response.status < 200 || response.status >= 300) {
        this.deleteError.set(response.message || 'Unable to delete menu item. Please try again.');
        return;
      }
      this.notice.set('Menu item deleted.');
      const page = this.menu.value();
      if (page?.content.length === 1 && page.pageNumber > 0) {
        this.updateQuery({ page: page.pageNumber - 1 }, false);
      } else {
        this.menu.reload();
      }
    } catch (error) {
      this.deleteError.set(
        getRequestErrorMessage(error, 'Unable to delete menu item. Please try again.'),
      );
    } finally {
      this.deleting.set(undefined);
    }
  }
}
