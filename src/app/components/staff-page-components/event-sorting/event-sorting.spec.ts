import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSorting } from './event-sorting';

describe('EventSorting', () => {
  let component: EventSorting;
  let fixture: ComponentFixture<EventSorting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient()],
      imports: [EventSorting],
    }).compileComponents();

    fixture = TestBed.createComponent(EventSorting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
