import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SuccessModal } from './success-modal';

describe('SuccessModal', () => {
  let component: SuccessModal;
  let fixture: ComponentFixture<SuccessModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessModal],
      providers: [NgbActiveModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
