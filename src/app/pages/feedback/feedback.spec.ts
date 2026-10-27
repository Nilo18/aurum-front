import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Feedback } from './feedback';
import { FeedbackService } from '../../services/feedback-service';

describe('Feedback invitation validation', () => {
  const params = new BehaviorSubject(convertToParamMap({ token: 'invitation' }));
  let resolveValidation: (value: { status: number; message: string }) => void;
  let rejectValidation: (reason: unknown) => void;
  let calls: number;

  beforeEach(() => {
    calls = 0;
    params.next(convertToParamMap({ token: 'invitation' }));
    TestBed.configureTestingModule({
      imports: [Feedback],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParamMap: params } },
        {
          provide: FeedbackService,
          useValue: {
            validateInvitation: () => {
              calls++;
              return new Promise((resolve, reject) => {
                resolveValidation = resolve;
                rejectValidation = reject;
              });
            },
          },
        },
      ],
    });
  });

  it('shows the loader until validation succeeds, then reveals the form', async () => {
    const fixture = TestBed.createComponent(Feedback);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-loader-component')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-feedback-form')).toBeNull();
    resolveValidation({ status: 200, message: 'Verified' });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-feedback-form')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-loader-component')).toBeNull();
  });

  it('shows backend errors and supports retrying', async () => {
    const fixture = TestBed.createComponent(Feedback);
    fixture.detectChanges();
    rejectValidation({ error: { error: 'Invitation expired' } });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Invitation expired',
    );
    expect(fixture.nativeElement.querySelector('app-feedback-form')).toBeNull();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(calls).toBe(2);
    expect(fixture.nativeElement.querySelector('app-loader-component')).toBeTruthy();
    resolveValidation({ status: 200, message: 'Verified' });
    await fixture.whenStable();
  });

  it('rejects a missing token without calling the backend', async () => {
    params.next(convertToParamMap({}));
    const fixture = TestBed.createComponent(Feedback);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(calls).toBe(0);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('missing');
    expect(fixture.nativeElement.querySelector('app-feedback-form')).toBeNull();
  });

  it('handles unsuccessful response statuses and unexpected errors', async () => {
    const fixture = TestBed.createComponent(Feedback);
    fixture.detectChanges();
    resolveValidation({ status: 403, message: 'Invalid invitation' });
    await fixture.whenStable();
    expect(fixture.componentInstance.validationErrorMsg()).toBe('Invalid invitation');
    const retry = fixture.componentInstance.validateInvitation();
    rejectValidation({ status: 0 });
    await retry;
    expect(fixture.componentInstance.validating()).toBe(false);
    expect(fixture.componentInstance.validationFailed()).toBe(true);
    expect(fixture.componentInstance.validationErrorMsg()).toContain('Please try again');
  });
});
