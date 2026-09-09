import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginHero } from './login-hero';

describe('LoginHero', () => {
  let component: LoginHero;
  let fixture: ComponentFixture<LoginHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginHero]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginHero);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
