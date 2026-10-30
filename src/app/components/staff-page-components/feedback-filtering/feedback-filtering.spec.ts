import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackFiltering } from './feedback-filtering';

describe('FeedbackFiltering', () => {
  let component: FeedbackFiltering;
  let fixture: ComponentFixture<FeedbackFiltering>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackFiltering],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackFiltering);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
