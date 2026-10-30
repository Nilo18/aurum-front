import { TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FeedbackDetailsModal } from './feedback-details-modal';
describe('FeedbackDetailsModal', () => {
  it('renders feedback and supports close and dismiss actions', () => {
    const modal = { close: vi.fn(), dismiss: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: NgbActiveModal, useValue: modal }] });
    const fixture = TestBed.createComponent(FeedbackDetailsModal);
    fixture.componentInstance.feedback = {
      publicId: 'feedback-1',
      author: 'Nino',
      commentDate: '2026-10-30T12:00:00',
      rating: 5,
      description: 'Excellent event',
    };
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Nino');
    expect(text).toContain('5 / 5');
    expect(text).toContain('Excellent event');
    fixture.nativeElement.querySelector('[aria-label="Close details"]').click();
    expect(modal.dismiss).toHaveBeenCalledOnce();
    fixture.nativeElement.querySelector('.modal-footer button').click();
    expect(modal.close).toHaveBeenCalledOnce();
  });
});
