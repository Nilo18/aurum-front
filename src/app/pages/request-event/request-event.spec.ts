import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestEvent } from './request-event';
import { provideRouter } from '@angular/router';

describe('RequestEvent', () => {
  let component: RequestEvent;
  let fixture: ComponentFixture<RequestEvent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestEvent], providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestEvent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
