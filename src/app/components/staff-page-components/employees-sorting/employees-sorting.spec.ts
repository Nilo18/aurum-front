import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesSorting } from './employees-sorting';

describe('EmployeesSorting', () => {
  let component: EmployeesSorting;
  let fixture: ComponentFixture<EmployeesSorting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient()],
      imports: [EmployeesSorting],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeesSorting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
