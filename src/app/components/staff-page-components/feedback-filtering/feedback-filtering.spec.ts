import { TestBed } from '@angular/core/testing';
import { FeedbackFiltering } from './feedback-filtering';
describe('FeedbackFiltering', () => {
  it('emits selected ratings and dates and disables the fieldset while busy', async () => {
    const fixture = TestBed.createComponent(FeedbackFiltering);
    const changed = vi.fn();
    fixture.componentInstance.changed.subscribe(changed);
    fixture.detectChanges();
    await fixture.whenStable();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#feedback-ratingFrom');
    expect(select.options.length).toBe(6);
    select.selectedIndex = 3;
    select.dispatchEvent(new Event('change'));
    expect(changed).toHaveBeenLastCalledWith({ ratingFrom: 3 });
    const date: HTMLInputElement = fixture.nativeElement.querySelector('#feedback-commentFrom');
    date.value = '2026-10-30';
    date.dispatchEvent(new Event('input'));
    expect(changed).toHaveBeenLastCalledWith({ commentFrom: '2026-10-30' });
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('fieldset').disabled).toBe(true);
  });
});
