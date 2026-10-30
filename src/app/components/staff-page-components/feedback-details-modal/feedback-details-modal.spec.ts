import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { FeedbackDetailsModal } from './feedback-details-modal';

describe('FeedbackDetailsModal', () => {
  let component: FeedbackDetailsModal;
  let fixture: ComponentFixture<FeedbackDetailsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackDetailsModal],
      providers: [NgbActiveModal],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackDetailsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
