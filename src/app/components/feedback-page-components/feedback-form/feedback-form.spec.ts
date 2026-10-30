import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedbackForm } from './feedback-form';
import { FeedbackService } from '../../../services/feedback-service';
import { vi } from 'vitest';

describe('FeedbackForm', () => {
  let fixture: ComponentFixture<FeedbackForm>;
  let component: FeedbackForm;
  const createFeedback = vi.fn();

  beforeEach(async () => {
    createFeedback.mockReset();
    await TestBed.configureTestingModule({
      imports: [FeedbackForm],
      providers: [{ provide: FeedbackService, useValue: { createFeedback } }],
    }).compileComponents();
    fixture = TestBed.createComponent(FeedbackForm);
    fixture.componentRef.setInput('tokenHash', 'invitation');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillForm() {
    component.feedbackForm.patchValue({
      author: 'Guest',
      commentDate: '2026-10-30',
      rating: '5',
      description: 'Wonderful experience',
    });
  }

  it('renders five ratings and validates before sending', async () => {
    expect(fixture.nativeElement.querySelectorAll('input[type="radio"]').length).toBe(5);
    await component.createFeedback();
    expect(createFeedback).not.toHaveBeenCalled();
    expect(component.fieldInvalid('author')).toBe(true);
  });

  it('locks the form during submission and prevents duplicate requests after success', async () => {
    fillForm();
    let resolveRequest!: (value: unknown) => void;
    createFeedback.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const pending = component.createFeedback();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('fieldset').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('button').textContent).toContain('Sending');
    await component.createFeedback();
    expect(createFeedback).toHaveBeenCalledTimes(1);
    expect(createFeedback).toHaveBeenCalledWith({
      tokenHash: 'invitation',
      author: 'Guest',
      commentDate: '2026-10-30',
      rating: 5,
      description: 'Wonderful experience',
    });
    resolveRequest({});
    await pending;
    fixture.detectChanges();
    expect(component.isSubmitting()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'has been sent',
    );
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
    await component.createFeedback();
    expect(createFeedback).toHaveBeenCalledTimes(1);
  });

  it('shows backend errors, preserves values, and allows retrying', async () => {
    fillForm();
    createFeedback.mockRejectedValueOnce(
      new HttpErrorResponse({
        status: 400,
        error: { message: 'Invitation expired' },
      }),
    );
    await component.createFeedback();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Invitation expired',
    );
    expect(fixture.nativeElement.querySelector('fieldset').disabled).toBe(false);
    expect(component.feedbackForm.controls.description.value).toBe('Wonderful experience');
    createFeedback.mockResolvedValueOnce({});
    await component.createFeedback();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(component.submitted()).toBe(true);
  });
});
