import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackSorting } from './feedback-sorting';

describe('FeedbackSorting', () => {
  let component: FeedbackSorting;
  let fixture: ComponentFixture<FeedbackSorting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackSorting],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackSorting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
