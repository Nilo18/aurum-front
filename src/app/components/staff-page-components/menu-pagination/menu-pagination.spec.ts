import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuPagination } from './menu-pagination';

describe('MenuPagination', () => {
  let component: MenuPagination;
  let fixture: ComponentFixture<MenuPagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuPagination],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuPagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
