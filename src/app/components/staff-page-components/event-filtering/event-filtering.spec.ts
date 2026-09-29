import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventFiltering } from './event-filtering';

describe('EventFiltering', () => {
  let component: EventFiltering;
  let fixture: ComponentFixture<EventFiltering>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient()],
      imports: [EventFiltering],
    }).compileComponents();

    fixture = TestBed.createComponent(EventFiltering);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
