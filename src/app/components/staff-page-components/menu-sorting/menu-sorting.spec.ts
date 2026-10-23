import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuSorting } from './menu-sorting';

describe('MenuSorting', () => {
  let component: MenuSorting;
  let fixture: ComponentFixture<MenuSorting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuSorting],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuSorting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
