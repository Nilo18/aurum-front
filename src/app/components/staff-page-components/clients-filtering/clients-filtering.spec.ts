import { ClientType } from '../../../services/client-service';
import { TestBed } from '@angular/core/testing';
import { ClientsFiltering } from './clients-filtering';
describe('ClientsFiltering', () => {
  it('emits normalized filter changes and preserves valid values', () => {
    const fixture = TestBed.createComponent(ClientsFiltering);
    const component = fixture.componentInstance;
    const changed = vi.fn();
    component.changed.subscribe(changed);

    component.filter(ClientType.PERSON);
    expect(changed).toHaveBeenLastCalledWith({ type: 'PERSON' });
    component.filter(undefined);
    expect(changed).toHaveBeenLastCalledWith({ type: undefined });
    fixture.componentRef.setInput('disabled', true);
    component.filter(ClientType.PERSON);
    expect(changed).toHaveBeenCalledTimes(2);
  });
});
