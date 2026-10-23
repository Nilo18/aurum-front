import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Menu } from './menu';
import { MenuService, CuisineType } from '../../../services/menu-service';
import { MenuFiltering } from '../menu-filtering/menu-filtering';
import { MenuSorting } from '../menu-sorting/menu-sorting';
import { MenuPagination } from '../menu-pagination/menu-pagination';
import { By } from '@angular/platform-browser';

describe('Menu', () => {
  const item = {
    publicId: 'dish-1',
    name: 'Dish',
    category: 'APPETIZER' as const,
    type: CuisineType.GENERAL,
    pricePerPerson: 10,
  };
  const getMenuItems = vi.fn();
  const deleteMenuItem = vi.fn();
  const open = vi.fn();
  beforeEach(() => {
    vi.resetAllMocks();
    getMenuItems.mockImplementation((query) =>
      of({ content: [item], pageNumber: query.page, pageSize: query.size, totalElements: 30 }),
    );
    TestBed.configureTestingModule({
      imports: [Menu],
      providers: [
        { provide: MenuService, useValue: { getMenuItems, deleteMenuItem } },
        { provide: NgbModal, useValue: { open } },
      ],
    });
  });
  async function setup() {
    const fixture = TestBed.createComponent(Menu);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }
  it('loads menu items and applies child outputs through the parent query', async () => {
    const fixture = await setup();
    expect(getMenuItems).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      search: '',
      sortBy: '',
      sortDirection: '',
    });
    fixture.debugElement
      .query(By.directive(MenuPagination))
      .componentInstance.changed.emit({ page: 2, size: 10 });
    await fixture.whenStable();
    expect(fixture.componentInstance.menuQuery().page).toBe(2);
    fixture.debugElement
      .query(By.directive(MenuFiltering))
      .componentInstance.changed.emit({ category: 'DESSERT', priceFrom: 0 });
    await fixture.whenStable();
    expect(getMenuItems).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 0, category: 'DESSERT', priceFrom: 0 }),
    );
    fixture.debugElement
      .query(By.directive(MenuSorting))
      .componentInstance.changed.emit({ sortBy: 'pricePerPerson', sortDirection: 'desc' });
    await fixture.whenStable();
    expect(getMenuItems).toHaveBeenLastCalledWith(
      expect.objectContaining({ sortBy: 'pricePerPerson', sortDirection: 'desc' }),
    );
  });
  it('refreshes after a saved dialog and retains the query', async () => {
    const fixture = await setup();
    const modal = {
      componentInstance: { menuItem: undefined, isSubmitting: () => false },
      result: Promise.resolve('Menu item saved.'),
    };
    open.mockReturnValue(modal);
    fixture.componentInstance.open(item);
    await Promise.resolve();
    await fixture.whenStable();
    expect(modal.componentInstance.menuItem).toEqual(item);
    expect(getMenuItems).toHaveBeenCalledTimes(2);
  });
  it('moves back when deleting the final item on a later page and reports failures', async () => {
    const fixture = await setup();
    fixture.componentInstance.updateQuery({ page: 2 }, false);
    await fixture.whenStable();
    deleteMenuItem.mockResolvedValue({ status: 200 });
    await fixture.componentInstance.deleteMenuItem(item.publicId);
    await fixture.whenStable();
    expect(fixture.componentInstance.menuQuery().page).toBe(1);
    deleteMenuItem.mockRejectedValue(new Error('Failed'));
    await fixture.componentInstance.deleteMenuItem(item.publicId);
    expect(fixture.componentInstance.deleteError()).toBeTruthy();
    expect(fixture.componentInstance.deleting()).toBeUndefined();
  });
  it('renders a failed load and retries without crashing', async () => {
    getMenuItems.mockReturnValueOnce(throwError(() => new Error('Unavailable')));
    const fixture = await setup();
    expect(fixture.nativeElement.textContent).toContain('Unable to load menu items');
    fixture.componentInstance.menu.reload();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Dish');
  });
  it('searches through the API, resets the page, and preserves filters', async () => {
    const fixture = await setup();
    fixture.componentInstance.updateQuery({ page: 2, category: 'DESSERT' }, false);
    await fixture.whenStable();
    fixture.detectChanges();
    const search: HTMLInputElement = fixture.nativeElement.querySelector('#menu-search');
    search.value = 'cake';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(getMenuItems).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'cake', page: 0, category: 'DESSERT' }),
    );
    search.value = '';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(getMenuItems).toHaveBeenLastCalledWith(expect.objectContaining({ search: '', page: 0 }));
  });
});
