import { TestBed } from '@angular/core/testing';
import { EmployeesPagination } from './employees-pagination';
describe('EmployeesPagination', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [EmployeesPagination] });
    const fixture = TestBed.createComponent(EmployeesPagination);
    const changed = vi.fn();
    fixture.componentInstance.changed.subscribe(changed);
    return { fixture, component: fixture.componentInstance, changed };
  }
  it('shows an empty range before results arrive', () => {
    const { component } = setup();
    expect(component.first()).toBe(0);
    expect(component.last()).toBe(0);
    expect(component.pages()).toEqual([]);
  });
  it('calculates the final partial page and a five-page window', () => {
    const { fixture, component } = setup();
    fixture.componentRef.setInput('query', { page: 6, size: 10 });
    fixture.componentRef.setInput('page', {
      content: [],
      pageNumber: 6,
      pageSize: 10,
      totalElements: 63,
    });
    fixture.detectChanges();
    expect(component.first()).toBe(61);
    expect(component.last()).toBe(63);
    expect(component.pageCount()).toBe(7);
    expect(component.pages()).toEqual([2, 3, 4, 5, 6]);
  });
  it('emits valid navigation and size changes and rejects unavailable pages', () => {
    const { fixture, component, changed } = setup();
    fixture.componentRef.setInput('page', {
      content: [],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 23,
    });
    component.paginate(1);
    expect(changed).toHaveBeenLastCalledWith({ page: 1, size: 10 });
    component.paginate(0, 25);
    expect(changed).toHaveBeenLastCalledWith({ page: 0, size: 25 });
    component.paginate(-1);
    component.paginate(3);
    fixture.componentRef.setInput('disabled', true);
    component.paginate(1);
    expect(changed).toHaveBeenCalledTimes(2);
  });
});
