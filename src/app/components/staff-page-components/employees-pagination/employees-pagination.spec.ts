import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesPagination } from './employees-pagination';

describe('EmployeesPagination', () => {
  let component: EmployeesPagination;
  let fixture: ComponentFixture<EmployeesPagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient()],
      imports: [EmployeesPagination],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeesPagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
