import { TestBed } from '@angular/core/testing';
import { DemoLoadingCard } from './demo-loading-card';
describe('DemoLoadingCard', () => {
  it('announces loading and exposes a retry action after failure', () => {
    const fixture = TestBed.createComponent(DemoLoadingCard);
    fixture.componentRef.setInput('isLoading', true);
    fixture.componentRef.setInput('errorMessage', '');
    fixture.componentRef.setInput('loadingMessage', 'Signing in');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'Signing in',
    );
    expect(fixture.nativeElement.querySelector('[aria-busy]').getAttribute('aria-busy')).toBe(
      'true',
    );
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    const retry = vi.fn();
    fixture.componentInstance.retry.subscribe(retry);
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('errorMessage', 'Server unavailable');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Server unavailable',
    );
    fixture.nativeElement.querySelector('button').click();
    expect(retry).toHaveBeenCalledOnce();
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
  });
});
