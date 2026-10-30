import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmActionModal } from './confirm-action-modal';

describe('ConfirmActionModal', () => {
  let component: ConfirmActionModal;
  let fixture: ComponentFixture<ConfirmActionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmActionModal],
      providers: [NgbActiveModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmActionModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('renders the action-specific title and message', () => {
    fixture = TestBed.createComponent(ConfirmActionModal);
    component = fixture.componentInstance;
    component.title = 'Delete event?';
    component.msg = 'This action cannot be undone.';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Delete event?');
    expect(fixture.nativeElement.textContent).toContain('This action cannot be undone.');
  });

  it('dismisses on Cancel and returns true on Confirm', () => {
    const dismiss = vi.spyOn(component.modal, 'dismiss');
    const close = vi.spyOn(component.modal, 'close');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    expect(dismiss).toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
    buttons[1].click();
    expect(close).toHaveBeenCalledWith(true);
  });
});
