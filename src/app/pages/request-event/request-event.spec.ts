import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestEvent } from './request-event';
import { provideRouter } from '@angular/router';
import { MenuService } from '../../services/menu-service';

describe('RequestEvent', () => {
  let component: RequestEvent;
  let fixture: ComponentFixture<RequestEvent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestEvent], providers: [provideRouter([]), { provide: MenuService, useValue: { getMenuItems: async () => [] } }]
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
