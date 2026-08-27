import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreStaffDemo } from './explore-staff-demo';

describe('ExploreStaffDemo', () => {
  let component: ExploreStaffDemo;
  let fixture: ComponentFixture<ExploreStaffDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreStaffDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreStaffDemo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
