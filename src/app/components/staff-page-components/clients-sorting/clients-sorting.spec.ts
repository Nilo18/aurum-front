import { TestBed } from '@angular/core/testing';
import { ClientsSorting } from './clients-sorting';
describe('ClientsSorting', () => {
  it('emits the selected sort and clears direction when sorting is reset', () => {
    const fixture = TestBed.createComponent(ClientsSorting);
    const changed = vi.fn();
    fixture.componentInstance.changed.subscribe(changed);
    fixture.componentInstance.sort('name', 'ASC');
    expect(changed).toHaveBeenLastCalledWith({ sortBy: 'name', sortDirection: 'ASC' });
    fixture.componentInstance.sort('', 'DESC');
    expect(changed).toHaveBeenLastCalledWith({ sortBy: '', sortDirection: '' });
    fixture.componentRef.setInput('disabled', true);
    fixture.componentInstance.sort('name', 'DESC');
    expect(changed).toHaveBeenCalledTimes(2);
  });
});
