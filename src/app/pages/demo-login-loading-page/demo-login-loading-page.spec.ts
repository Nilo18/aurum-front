import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoLoginLoadingPage } from './demo-login-loading-page';

describe('DemoLoginLoadingPage', () => {
  let component: DemoLoginLoadingPage;
  let fixture: ComponentFixture<DemoLoginLoadingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoLoginLoadingPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemoLoginLoadingPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
