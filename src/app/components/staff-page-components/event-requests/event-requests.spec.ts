import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventRequests } from './event-requests';

describe('EventRequests', () => {
  let component: EventRequests;
  let fixture: ComponentFixture<EventRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventRequests],
    }).compileComponents();

    fixture = TestBed.createComponent(EventRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
