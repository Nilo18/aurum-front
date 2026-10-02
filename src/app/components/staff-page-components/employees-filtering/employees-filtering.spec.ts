import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesFiltering } from './employees-filtering';

describe('EmployeesFiltering', () => {
  let component: EmployeesFiltering;
  let fixture: ComponentFixture<EmployeesFiltering>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient()],
      imports: [EmployeesFiltering],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeesFiltering);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
