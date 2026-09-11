import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterValidationErrorDisplayer } from './register-validation-error-displayer';

describe('RegisterValidationErrorDisplayer', () => {
  let component: RegisterValidationErrorDisplayer;
  let fixture: ComponentFixture<RegisterValidationErrorDisplayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterValidationErrorDisplayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterValidationErrorDisplayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
