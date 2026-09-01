import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RequestEventCta } from './request-event-cta';

describe('RequestEventCta', () => {
  let component: RequestEventCta;
  let fixture: ComponentFixture<RequestEventCta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestEventCta],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestEventCta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
