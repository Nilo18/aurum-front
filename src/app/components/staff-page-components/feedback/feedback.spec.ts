import { of as emptyPageResult } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Feedback } from './feedback';
import { FeedbackService } from '../../../services/feedback-service';

describe('Feedback', () => {
  const item = {
    publicId: 'feedback-1',
    author: 'Guest',
    commentDate: '2026-10-30',
    rating: 5,
    description: 'Wonderful service',
  };
  const service = {
    getAllFeedback: vi.fn(() =>
      of({ content: [item], pageNumber: 0, totalElements: 1, totalPages: 1, pageSize: 10 }),
    ),
    deleteFeedback: vi.fn().mockResolvedValue({ status: 200, message: 'Deleted' }),
  };
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [Feedback],
      providers: [
        { provide: FeedbackService, useValue: service },
        { provide: NgbModal, useValue: { open: vi.fn() } },
      ],
    });
  });
  it('reruns the resource with child query changes and resets pagination for filters', async () => {
    const fixture = TestBed.createComponent(Feedback);
    await fixture.whenStable();
    fixture.componentInstance.updateQuery({ page: 2 }, false);
    await fixture.whenStable();
    fixture.componentInstance.updateQuery({
      ratingFrom: 4,
      sortBy: 'rating',
      sortDirection: 'DESC',
    });
    await fixture.whenStable();
    expect(service.getAllFeedback).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 0, ratingFrom: 4, sortBy: 'rating', sortDirection: 'DESC' }),
    );
  });
  it('moves back a page when deleting the last record on that page', async () => {
    const fixture = TestBed.createComponent(Feedback);
    await fixture.whenStable();
    service.getAllFeedback.mockReturnValueOnce(
      of({ content: [item], pageNumber: 1, totalElements: 11, totalPages: 2, pageSize: 10 }),
    );
    fixture.componentInstance.updateQuery({ page: 1 }, false);
    await fixture.whenStable();
    await fixture.componentInstance.deleteFeedback(item.publicId);
    expect(fixture.componentInstance.feedbackQuery().page).toBe(0);
    expect(fixture.componentInstance.notice()).toBe('Feedback deleted.');
  });
  it('shows backend load errors without rendering an empty state', async () => {
    service.getAllFeedback.mockReturnValueOnce(
      throwError(() => new HttpErrorResponse({ status: 503 })),
    );
    const fixture = TestBed.createComponent(Feedback);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('The service is temporarily unavailable');
    expect(fixture.nativeElement.textContent).not.toContain('No records found');
  });
  it('keeps deletion errors visible and releases the busy state', async () => {
    const fixture = TestBed.createComponent(Feedback);
    await fixture.whenStable();
    service.deleteFeedback.mockRejectedValueOnce(
      new HttpErrorResponse({ status: 403, error: { message: 'Deletion is forbidden' } }),
    );
    await fixture.componentInstance.deleteFeedback(item.publicId);
    expect(fixture.componentInstance.deleteError()).toBe('Deletion is forbidden');
    expect(fixture.componentInstance.busy()).toBe(false);
  });
});

describe('Feedback query state', () => {
  it('resets pagination for new criteria and preserves criteria during paging', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FeedbackService,
          useValue: {
            getAllFeedback: () =>
              emptyPageResult({ content: [], pageNumber: 0, pageSize: 10, totalElements: 0 }),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(Feedback);
    const component = fixture.componentInstance;
    component.updateQuery({ page: 3, size: 25 }, false);
    component.updateQuery({ sortBy: 'name', sortDirection: 'ASC' });
    expect(component.feedbackQuery()).toMatchObject({
      page: 0,
      size: 25,
      sortBy: 'name',
      sortDirection: 'ASC',
    });
    component.updateQuery({ page: 2 }, false);
    expect(component.feedbackQuery()).toMatchObject({
      page: 2,
      size: 25,
      sortBy: 'name',
      sortDirection: 'ASC',
    });
  });
});
