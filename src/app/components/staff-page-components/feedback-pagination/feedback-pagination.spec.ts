import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackPagination } from './feedback-pagination';

describe('FeedbackPagination', () => {
  let component: FeedbackPagination;
  let fixture: ComponentFixture<FeedbackPagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackPagination],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackPagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
