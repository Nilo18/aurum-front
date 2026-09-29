import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventPagination } from './event-pagination';

describe('EventPagination', () => {
  let component: EventPagination;
  let fixture: ComponentFixture<EventPagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient()],
      imports: [EventPagination],
    }).compileComponents();

    fixture = TestBed.createComponent(EventPagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
