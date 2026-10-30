import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { RateLimitErrorModal } from './rate-limit-error-modal';

describe('RateLimitErrorModal', () => {
  let component: RateLimitErrorModal;
  let fixture: ComponentFixture<RateLimitErrorModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateLimitErrorModal],
      providers: [NgbActiveModal],
    }).compileComponents();

    fixture = TestBed.createComponent(RateLimitErrorModal);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('counts down the interceptor value and enables Continue at zero', () => {
    vi.useFakeTimers();
    try {
      component.secondsLeft = 2;
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.rate-limit__button');
      expect(button.disabled).toBe(true);
      vi.advanceTimersByTime(1000);
      fixture.detectChanges();
      expect(component.secondsLeft).toBe(1);
      vi.advanceTimersByTime(2000);
      fixture.detectChanges();
      expect(component.secondsLeft).toBe(0);
      expect(button.disabled).toBe(false);
      const close = vi.spyOn(component.modal, 'close');
      button.click();
      expect(close).toHaveBeenCalled();
    } finally {
      fixture.destroy();
      vi.useRealTimers();
    }
  });

  it('cleans up the countdown when dismissed', () => {
    vi.useFakeTimers();
    try {
      component.secondsLeft = 5;
      fixture.detectChanges();
      fixture.destroy();
      vi.advanceTimersByTime(2000);
      expect(component.secondsLeft).toBe(5);
    } finally {
      vi.useRealTimers();
    }
  });
});
