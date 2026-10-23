import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuFiltering } from './menu-filtering';

describe('MenuFiltering', () => {
  let component: MenuFiltering;
  let fixture: ComponentFixture<MenuFiltering>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuFiltering],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuFiltering);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
